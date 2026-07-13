-- Migration: Add reference_number column to public.leads and public.customers
-- Also creates the payment_sequences table and atomic generator function if they do not exist yet.

-- 1. Create table to track receipt sequences per year if not exists
CREATE TABLE IF NOT EXISTS public.payment_sequences (
    year INTEGER PRIMARY KEY,
    current_sequence INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on payment_sequences
ALTER TABLE public.payment_sequences ENABLE ROW LEVEL SECURITY;

-- Drop policy if it already exists and recreate it to avoid duplication errors
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read/write to payment_sequences" ON public.payment_sequences;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Allow authenticated read/write to payment_sequences" 
ON public.payment_sequences
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 2. Create atomic concurrency-safe sequence generator function
CREATE OR REPLACE FUNCTION public.generate_next_payment_sequence(payment_year INTEGER)
RETURNS INTEGER AS $$
DECLARE
    next_seq INTEGER;
BEGIN
    -- Atomic upsert with row locking
    INSERT INTO public.payment_sequences (year, current_sequence)
    VALUES (payment_year, 1)
    ON CONFLICT (year)
    DO UPDATE SET current_sequence = public.payment_sequences.current_sequence + 1
    RETURNING current_sequence INTO next_seq;
    
    RETURN next_seq;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Add column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS reference_number TEXT;

-- 4. Add column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS reference_number TEXT;


-- 5. Backfill existing leads and customers using current sequences
DO $$
DECLARE
    lead_rec RECORD;
    cust_rec RECORD;
    seq_val INTEGER;
    ref_num TEXT;
    lead_year INTEGER;
BEGIN
    -- Initialize or check sequences and backfill leads
    FOR lead_rec IN 
        SELECT id, created_at, reference_number 
        FROM public.leads 
        WHERE reference_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        lead_year := COALESCE(EXTRACT(YEAR FROM lead_rec.created_at)::INTEGER, 2026);
        
        -- Atomically increment and get sequence using our function
        seq_val := public.generate_next_payment_sequence(lead_year);
        
        ref_num := 'E-' || LPAD(seq_val::text, 3, '0') || '-' || lead_year::text;
        
        -- Update lead
        UPDATE public.leads 
        SET reference_number = ref_num 
        WHERE id = lead_rec.id;
        
        -- Sync to corresponding customer if exists
        UPDATE public.customers 
        SET reference_number = ref_num 
        WHERE lead_id = lead_rec.id;
    END LOOP;

    -- Handle any customers that don't have a lead_id (manual customers)
    FOR cust_rec IN 
        SELECT id, created_at, reference_number 
        FROM public.customers 
        WHERE reference_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        lead_year := COALESCE(EXTRACT(YEAR FROM cust_rec.created_at)::INTEGER, 2026);
        
        -- Atomically increment and get sequence using our function
        seq_val := public.generate_next_payment_sequence(lead_year);
        
        ref_num := 'E-' || LPAD(seq_val::text, 3, '0') || '-' || lead_year::text;
        
        -- Update customer
        UPDATE public.customers 
        SET reference_number = ref_num 
        WHERE id = cust_rec.id;
    END LOOP;
END $$;
