import { z } from 'zod';
import { emailSchema, phoneSchema } from './common.schema';

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: emailSchema,
  phone_number: phoneSchema.optional().nullable().or(z.literal('')),
  role: z.enum([
    'Super Admin',
    'Admin',
    'Sales Executive',
    'Receptionist',
    'Team Leader',
    'Service Executive',
    'Branch Manager',
    'Accounts Team',
  ]),
  department: z.enum(['Sales', 'Operations', 'HR', 'CA', 'Others']).optional().nullable(),
  skills: z.array(z.string()).default([]).optional(),
  is_active: z.boolean().default(true),
  avatar_url: z.string().optional().nullable(),
  branch_id: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(['Male', 'Female', 'Other']).optional().nullable(),
  reporting_to: z.string().optional().nullable(),
  employee_code: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type UserSchemaType = z.infer<typeof userSchema>;
