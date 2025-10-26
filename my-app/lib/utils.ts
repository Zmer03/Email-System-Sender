import { v4 as uuidv4 } from 'uuid';


export function generateRequestId(): string {
  return uuidv4();
}


export function validatePayloadSize(payload: string, maxSizeKB: number = 2): boolean {
  const sizeKB = Buffer.byteLength(payload, 'utf8') / 1024;
  return sizeKB <= maxSizeKB;
}


export function sanitizeErrorMessage(error: any): string {
  
  if (error.code && error.code.startsWith('ER_')) {
    return 'Database error occurred';
  }
  
  if (error.message && error.message.includes('SQL')) {
    return 'Database error occurred';
  }
  
  return 'An unexpected error occurred';
}
