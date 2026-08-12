import { z } from 'zod';

export const lookupSchema = z.object({
  phone: z.string().trim().min(1, 'Phone is required'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
});
