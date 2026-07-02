import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Please provide a valid email address').toLowerCase().trim(),
  password: z.string({ error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.email('Please provide a valid email address').toLowerCase().trim(),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
