import { z } from 'zod';

const pageEnum = z.enum([
  'scanner',
  'register',
  'registrations',
  'volunteers',
  'abhishek',
  'fancy-dress',
  'laddu-gopal',
  // REFERRAL DISABLED
  // 'leaderboard',
  'admins',
]);

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createAdminSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(64)
      .regex(/^[a-zA-Z0-9._-]+$/, 'Username may only contain letters, numbers, . _ -'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['admin', 'desk']),
    pages: z.array(pageEnum).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'admin' && (!data.pages || data.pages.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one page for admin role',
        path: ['pages'],
      });
    }
    if (data.pages?.includes('admins')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only super_admin may have admins page',
        path: ['pages'],
      });
    }
  });

export const updateAdminSchema = z
  .object({
    role: z.enum(['admin', 'desk']).optional(),
    pages: z.array(pageEnum).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.pages?.includes('admins')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only super_admin may have admins page',
        path: ['pages'],
      });
    }
    if (data.role === 'admin' && data.pages !== undefined && data.pages.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one page for admin role',
        path: ['pages'],
      });
    }
  });
