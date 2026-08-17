import { z } from 'zod';

export const adminListQuerySchema = z.object({
  search: z.string().trim().optional().default(''),
  checkedIn: z.enum(['true', 'false', 'all']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
});

/** Search + pagination for opt-in admin lists (no checkedIn filter) */
export const adminOptInQuerySchema = z.object({
  search: z.string().trim().optional().default(''),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(200),
});
