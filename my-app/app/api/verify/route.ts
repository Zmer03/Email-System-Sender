import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token") || "";
  if (!token) return NextResponse.json({ error: "missing_token" }, { status: 400 });

  const conn = await getPool().getConnection();
  try {
    const [res] = await conn.execute(
      `UPDATE subscribers
         SET confirmed_at = NOW(), confirm_token = NULL, confirm_expires = NULL
       WHERE confirm_token = ? AND confirm_expires > NOW()`,
      [token]
    );
    // @ts-ignore mysql2 typings
    const changed = res?.affectedRows || 0;
    if (changed === 0) {
      return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } finally {
    conn.release();
  }
}
