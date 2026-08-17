import { z } from 'zod';

export const lookupSchema = z.object({
  phone: z
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
    }),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .refine((value) => {
      const [y, m, d] = value.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date <= today && y >= 1920;
    }, 'Enter a valid date of birth'),
});
