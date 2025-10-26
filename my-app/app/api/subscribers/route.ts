import { NextRequest, NextResponse } from 'next/server';
import { getPool, initializeSchema } from '@/lib/db';
import { subscriberSchema, subscriberResponseSchema } from '@/lib/schemas';
import { sendConfirmationEmail, sendConfirmationLinkEmail } from '@/lib/email';
import { generateRequestId, validatePayloadSize, sanitizeErrorMessage } from '@/lib/utils';
import { makeConfirmToken, ttlHours } from "@/lib/token";
import { randomUUID } from "crypto";

await initializeSchema();


// Create or update subscriber
export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const body = await request.text();
    if (body.length > 2048) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });

    const parsed = subscriberSchema.parse(JSON.parse(body));
    const { fullName, email } = parsed;

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const token = makeConfirmToken();
      const hours = ttlHours();

      await conn.execute(
        `INSERT INTO subscribers (email, full_name, confirm_token, confirm_expires)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))
         ON DUPLICATE KEY UPDATE
           full_name = VALUES(full_name),
           confirm_token   = IF(confirmed_at IS NULL, VALUES(confirm_token), confirm_token),
           confirm_expires = IF(confirmed_at IS NULL, VALUES(confirm_expires), confirm_expires)`,
        [email, fullName, token, hours]
      );

      const [rows] = await conn.execute(
        `SELECT confirmed_at, confirm_token, confirm_expires FROM subscribers WHERE email = ? LIMIT 1`,
        [email]
      );
      const row = (rows as any[])[0];

      await conn.commit();

      // If already confirmed, don't send another confirmation email
      if (row?.confirmed_at) {
        return NextResponse.json(
          { status: "already_confirmed", email, fullName },
          { status: 200 }
        );
      }

      await sendConfirmationLinkEmail(email, fullName, row?.confirm_token || token, requestId);

      return NextResponse.json(
        { status: "pending_confirmation", email, fullName, expiresInHours: hours },
        { status: 200 }
      );
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return NextResponse.json({ error: "internal_error", detail: String(err?.message || err) }, { status: 500 });
  }
}

// Check if subscriber exists
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    const emailValidation = subscriberSchema.shape.email.safeParse(email);
    if (!emailValidation.success) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    const connection = await getPool().getConnection();
    
    try {
      const [rows] = await getPool().query(
        "SELECT id, email, full_name, created_at FROM subscribers WHERE email = ?",
        [email]
      );
      
      const validatedResponse = subscriberResponseSchema.parse(rows);
      
      console.log(`Subscriber lookup successful for ${email}`);
      
      return NextResponse.json(validatedResponse, { status: 200 });
      
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Subscriber lookup failed:', error);
    
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}
