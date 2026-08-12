import { z } from 'zod';

export const checkinSchema = z.object({
  signedPayload: z.string().trim().min(1, 'Signed payload is required'),
});

export const checkinOverrideSchema = z.object({
  entryCode: z.string().trim().min(1, 'Entry code is required'),
  reason: z.string().trim().optional(),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
