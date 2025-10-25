import { z } from 'zod';

// Shared schema for client and server validation
export const subscriberSchema = z.object({
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  company: z.string().optional(), // Honeypot field
}).strict();

export type SubscriberInput = z.infer<typeof subscriberSchema>;

// Response schema for GET /api/subscribers
export const subscriberResponseSchema = z.object({
  exists: z.boolean(),
  fullName: z.string().optional(),
  createdAt: z.string().optional(),
});

export type SubscriberResponse = z.infer<typeof subscriberResponseSchema>;
