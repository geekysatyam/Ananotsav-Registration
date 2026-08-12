import { z } from 'zod';

const dobSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format');

const memberSchema = z.object({
  fullName: z.string().trim().min(1, 'Member full name is required'),
  dob: dobSchema,
  phone: z.string().trim().optional(),
});

export const registrationSchema = z.object({
  primary: z.object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    phone: z.string().trim().min(1, 'Phone is required'),
    dob: dobSchema,
    city: z.string().trim().min(1, 'City is required'),
    wantsReferral: z.boolean(),
    referredBy: z.string().trim().nullable().optional(),
  }),
  members: z.array(memberSchema).optional().default([]),
});
