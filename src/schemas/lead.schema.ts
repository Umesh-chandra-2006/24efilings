import { z } from 'zod';
import { emailSchema, phoneSchema, panSchema } from './common.schema';

export const subserviceDetailSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  is_tax_applicable: z.boolean().default(false).optional(),
  tax_amount: z.number().default(0).optional(),
  total_amount: z.number().default(0).optional(),
});

export const serviceSetSchema = z.object({
  id: z.string(),
  mainService: z.string().min(1, 'Main service is required'),
  subservices: z.array(subserviceDetailSchema).min(1, 'Add at least one sub-service'),
  service_fee: z.number().default(0).optional(),
  advance_amount: z.number().default(0).optional(),
  payment_mode: z.string().optional().nullable(),
  discount: z.number().default(0).optional(),
  promo_code: z.string().optional().nullable(),
  promo_discount_type: z.enum(['fixed', 'percentage']).optional().nullable(),
  promo_discount_value: z.number().default(0).optional(),
});

export const leadSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_category: z.string().optional().nullable(),
  industry_type: z.string().optional().nullable(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  phone_number: phoneSchema,
  alternate_mobile: z.string().optional().nullable().or(z.literal('')),
  alternate_is_whatsapp: z.boolean().default(false).optional(),
  pan_number: panSchema,
  residential_address: z.string().optional().nullable(),
  business_address: z.string().optional().nullable(),
  personal_flat_no: z.string().optional().nullable(),
  personal_street: z.string().optional().nullable(),
  personal_city: z.string().optional().nullable(),
  personal_state: z.string().optional().nullable(),
  personal_country: z.string().optional().nullable(),
  personal_zip_code: z.string().optional().nullable(),
  business_flat_no: z.string().optional().nullable(),
  business_street: z.string().optional().nullable(),
  business_city: z.string().optional().nullable(),
  business_state: z.string().optional().nullable(),
  business_country: z.string().optional().nullable(),
  business_zip_code: z.string().optional().nullable(),
  gender: z.enum(['Male', 'Female', 'Other']).optional().nullable(),
  priority: z.enum(['Hot', 'Warm', 'Cold']).default('Warm'),
  source: z.string().min(1, 'Lead source is required'),
  lead_source_id: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  service_sets: z.array(serviceSetSchema).optional().nullable(),
});

export type LeadSchemaType = z.infer<typeof leadSchema>;
