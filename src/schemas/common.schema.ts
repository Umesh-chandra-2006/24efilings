import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits');
export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format')
  .optional()
  .or(z.literal(''));

export const addressSchema = z.object({
  flatNo: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
});
