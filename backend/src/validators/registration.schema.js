import { z } from 'zod';

const dobSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format');

const memberSchema = z.object({
  fullName: z.string().trim().min(1, 'Member full name is required'),
  dob: dobSchema,
  phone: z.string().trim().optional(),
});

const fancyDressEntrySchema = z.object({
  childName: z.string().trim().min(1, 'Child name is required'),
  childDob: dobSchema,
  getupDetail: z.string().trim().optional().default(''),
});

const LADDU_GOPAL_SIZES = ['Small', 'Medium', 'Large', 'Other'];

export const registrationSchema = z
  .object({
    primary: z.object({
      fullName: z.string().trim().min(1, 'Full name is required'),
      phone: z.string().trim().min(1, 'Phone is required'),
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
      } else if (!LADDU_GOPAL_SIZES.includes(size) && size.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid Laddu Gopal size',
          path: ['primary', 'ladduGopalSize'],
        });
      }
    }
  });

export { LADDU_GOPAL_SIZES };
