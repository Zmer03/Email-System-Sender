import { v4 as uuidv4 } from 'uuid';

// Generate request ID
export function generateRequestId(): string {
  return uuidv4();
}

// Validate payload size
export function validatePayloadSize(payload: string, maxSizeKB: number = 2): boolean {
  const sizeKB = Buffer.byteLength(payload, 'utf8') / 1024;
  return sizeKB <= maxSizeKB;
}

// Sanitize error message for client
export function sanitizeErrorMessage(error: any): string {
  // Don't expose internal errors to client
  if (error.code && error.code.startsWith('ER_')) {
    return 'Database error occurred';
  }
  
  if (error.message && error.message.includes('SQL')) {
    return 'Database error occurred';
  }
  
  return 'An unexpected error occurred';
}
