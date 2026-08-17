import { z } from 'zod';

const dobSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
  .refine((value) => {
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) return false;
    if (y < 1920) return false;
    return true;
  }, 'Enter a valid date of birth (not in the future)');

const indianPhoneSchema = z
  .string()
  .trim()
  .transform((v) => {
    let d = v.replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
    return d;
  })
  .refine((d) => /^[6-9]\d{9}$/.test(d), {
    message: 'Enter a valid 10-digit Indian mobile number',
  });

const optionalIndianPhoneSchema = z
  .string()
  .trim()
  .optional()
  .transform((v) => {
    if (!v) return undefined;
    let d = v.replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
    return d || undefined;
  })
  .refine((d) => d === undefined || /^[6-9]\d{9}$/.test(d), {
    message: 'Enter a valid 10-digit Indian mobile number',
  });

const memberSchema = z.object({
  fullName: z.string().trim().min(1, 'Member full name is required'),
  dob: dobSchema,
  phone: optionalIndianPhoneSchema,
});

const fancyDressEntrySchema = z.object({
  childName: z.string().trim().min(1, 'Child name is required'),
  childDob: dobSchema,
  getupDetail: z.string().trim().optional().default(''),
});

const LADDU_GOPAL_SIZES = []; // free-text size on form; kept for any legacy imports

export const registrationSchema = z
  .object({
    primary: z.object({
      fullName: z.string().trim().min(1, 'Full name is required'),
      phone: indianPhoneSchema,
      dob: dobSchema,
      city: z.string().trim().min(1, 'City is required'),
      wantsReferral: z.boolean(),
      referredBy: z.string().trim().nullable().optional(),
      wantsVolunteer: z.boolean().optional().default(false),
      wantsPanchamritAbhishek: z.boolean().optional().default(false),
      wantsFancyDress: z.boolean().optional().default(false),
      fancyDressEntries: z.array(fancyDressEntrySchema).optional().default([]),
      wantsLadduGopal: z.boolean().optional().default(false),
      ladduGopalSize: z.string().trim().nullable().optional().default(null),
    }),
    members: z.array(memberSchema).optional().default([]),
  })
  .superRefine((data, ctx) => {
    const { primary } = data;

    if (primary.wantsFancyDress) {
      if (!primary.fancyDressEntries?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Add at least one child for fancy dress',
          path: ['primary', 'fancyDressEntries'],
        });
      }
    }

    if (primary.wantsLadduGopal) {
      const size = primary.ladduGopalSize?.trim();
      if (!size) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Laddu Gopal size is required',
          path: ['primary', 'ladduGopalSize'],
        });
      } else if (size.length > 80) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Laddu Gopal size is too long',
          path: ['primary', 'ladduGopalSize'],
        });
      }
    }
  });

export { LADDU_GOPAL_SIZES };
