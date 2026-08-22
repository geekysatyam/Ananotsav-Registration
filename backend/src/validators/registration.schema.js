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
    // Must be strictly before today (not today or future)
    if (date >= today) return false;
    if (y < 1920) return false;
    return true;
  }, 'Enter a valid date of birth (not today or in the future)');

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

const memberSchema = z.object({
  fullName: z.string().trim().min(1, 'Member full name is required'),
  dob: dobSchema,
  phone: indianPhoneSchema,
});

const LADDU_GOPAL_SIZES = []; // free-text size on form; kept for any legacy imports

function ageYearsFromDob(dobString) {
  const [y, m, d] = dobString.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  const monthDelta = today.getMonth() - (m - 1);
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < d)) age -= 1;
  return age;
}

export const registrationSchema = z
  .object({
    primary: z.object({
      fullName: z.string().trim().min(1, 'Full name is required'),
      phone: indianPhoneSchema,
      dob: dobSchema,
      city: z.string().trim().min(1, 'City is required'),
      // REFERRAL DISABLED
      // wantsReferral: z.boolean(),
      // referredBy: z.string().trim().nullable().optional(),
      wantsVolunteer: z.boolean().optional().default(false),
      wantsPanchamritAbhishek: z.boolean().optional().default(false),
      wantsFancyDress: z.boolean().optional().default(false),
      fancyDressParentPhone: z.string().trim().optional().nullable(),
      fancyDressParentName: z.string().trim().optional().default(''),
      fancyDressGetup: z.string().trim().optional().default(''),
      wantsLadduGopal: z.boolean().optional().default(false),
      ladduGopalSize: z.string().trim().nullable().optional().default(null),
    }),
    members: z.array(memberSchema).optional().default([]),
  })
  .superRefine((data, ctx) => {
    const { primary } = data;

    const sevaCount = [
      primary.wantsVolunteer,
      primary.wantsPanchamritAbhishek,
      primary.wantsFancyDress,
      primary.wantsLadduGopal,
    ].filter(Boolean).length;

    if (sevaCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choose only one Seva & celebrations option',
        path: ['primary'],
      });
    }

    if (primary.wantsFancyDress) {
      if (data.members.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Fancy dress is a standalone child registration — do not add family members',
          path: ['members'],
        });
      }

      if (ageYearsFromDob(primary.dob) > 12) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Fancy dress is for children 12 years and under',
          path: ['primary', 'dob'],
        });
      }

      const parentName = primary.fancyDressParentName?.trim();
      if (parentName && parentName.length > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Parent name is too long',
          path: ['primary', 'fancyDressParentName'],
        });
      }

      const getup = primary.fancyDressGetup?.trim();
      if (getup && getup.length > 200) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Getup detail is too long',
          path: ['primary', 'fancyDressGetup'],
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
