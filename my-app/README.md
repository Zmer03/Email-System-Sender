# Email Signup System

A Next.js 14 + TypeScript application that implements an email signup system with confirmation emails using MySQL, Zod validation, and Nodemailer.

## Features

- ✅ Email signup form with client and server-side validation
- ✅ MySQL database with parameterized queries
- ✅ Email confirmation with Nodemailer
- ✅ Honeypot spam protection
- ✅ Simple console logging
- ✅ Security best practices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MySQL (mysql2/promise)
- **Validation**: Zod
- **Email**: Nodemailer
- **Logging**: Console
- **Styling**: Tailwind CSS

## Quick Start

### 1. Install Dependencies

```bash
cd my-app
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the `my-app` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=email_signup
DB_PORT=3306

# Email Configuration (SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_mailtrap_username
SMTP_PASSWORD=your_mailtrap_password
SMTP_FROM=noreply@yourdomain.com

# Application Configuration
NODE_ENV=development
LOG_LEVEL=info
```

### 3. Database Setup

Create the MySQL database and run the SQL schema:

```sql
CREATE DATABASE email_signup;
```

The application will automatically create the required tables on first run:
- `subscribers` - stores subscriber information
- `subscribers_audit` - logs subscription events

### 4. Email Testing Setup

#### Option A: Mailtrap (Recommended for Development)

1. Sign up at [Mailtrap](https://mailtrap.io/)
2. Create an inbox
3. Use the provided SMTP credentials in your `.env.local`

#### Option B: Ethereal Email (Alternative)

1. Visit [Ethereal Email](https://ethereal.email/)
2. Create a test account
3. Use the generated credentials in your `.env.local`

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the signup form.

## API Endpoints

### POST /api/subscribers

Creates or updates a subscriber and sends a confirmation email.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Subscription successful. Please check your email for confirmation."
}
```

### GET /api/subscribers?email=<email>

Checks if a subscriber exists.

**Response:**
```json
{
  "exists": true,
  "fullName": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Database Schema

### subscribers table
```sql
CREATE TABLE subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

### Database Schema (Simplified)

Only the `subscribers` table is used. The audit table has been removed for simplicity.

## Security Features

- **Parameterized Queries**: All database queries use parameterized statements
- **Input Validation**: Zod schema validation on both client and server
- **Honeypot**: Hidden company field to catch spam bots
- **Payload Size Limit**: Rejects requests larger than 2KB
- **Error Sanitization**: Safe error messages without exposing internal details
- **Request Tracking**: UUID-based request IDs

## Testing with cURL

### Subscribe to newsletter
```bash
curl -X POST http://localhost:3000/api/subscribers \
  -H "Content-Type: application/json" \
  -d '{"fullName": "John Doe", "email": "john@example.com"}'
```

### Check if subscriber exists
```bash
curl "http://localhost:3000/api/subscribers?email=john@example.com"
```

## Development

### Project Structure

```
my-app/
├── app/
│   ├── api/subscribers/route.ts    # API endpoints
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Signup form
├── lib/
│   ├── db.ts                       # Database connection
│   ├── email.ts                    # Email service
│   ├── logger.ts                   # Logging service
│   ├── rateLimit.ts                # Rate limiting
│   ├── schemas.ts                  # Zod schemas
│   └── utils.ts                    # Utility functions
└── package.json
```

### Key Features

1. **Shared Validation**: Same Zod schema used on client and server
2. **Database Transactions**: Uses SELECT ... FOR UPDATE for cooldown checks
3. **Comprehensive Logging**: Request ID tracking with Pino
4. **Error Handling**: Graceful error handling with sanitized messages
5. **Type Safety**: Full TypeScript support throughout

## Production Considerations

- Set up proper SMTP service (SendGrid, AWS SES, etc.)
- Configure production database
- Set up monitoring and alerting
- Configure proper CORS settings
- Set up SSL/TLS certificates
- Configure proper logging levels

## License

MIT