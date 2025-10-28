# Email Signup System

A Next.js 14 + TypeScript application that implements an email signup system with confirmation emails using MySQL, Zod validation, and Nodemailer.

## Features

- ✅ Email signup form with client and server-side validation
- ✅ MySQL database with parameterized queries
- ✅ Email confirmation with Nodemailer
- ✅ Basic security measures

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MySQL (mysql2/promise)
- **Validation**: Zod
- **Email**: Nodemailer
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
DATABASE_URL= db_url

# Email Configuration (SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_mailtrap_username
SMTP_PASSWORD=your_mailtrap_password
SMTP_FROM=noreply@yourdomain.com

# Application Configuration
NODE_ENV=development
APP_BASE_URL="http://localhost:3000" 
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

1. Sign up at [Mailtrap](https://mailtrap.io/)
2. Create an inbox
3. Use the provided SMTP credentials in your `.env.local`

### 5. Run the Application

```bash
pnpm run dev
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
CREATE TABLE IF NOT EXISTS subscribers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(254) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL,
  confirm_token CHAR(43) NULL,
  confirm_expires TIMESTAMP NULL,
  UNIQUE KEY uq_email (email),
  UNIQUE KEY uq_confirm_token (confirm_token)
);
```

### Database Schema (Simplified)

Only the `subscribers` table is used. The audit table has been removed for simplicity.

## Security Features

- **Parameterized Queries**: All database queries use parameterized statements
- **Input Validation**: Zod schema validation on both client and server
- **Payload Size Limit**: Rejects requests larger than 2KB
- **Error Sanitization**: Safe error messages without exposing internal details

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