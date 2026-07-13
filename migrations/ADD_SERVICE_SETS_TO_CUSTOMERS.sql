-- Add service_sets column to customers table if it doesn't exist
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS service_sets jsonb;

-- Also ensure leads has service_sets (though previous setup likely handled it)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS service_sets jsonb;
