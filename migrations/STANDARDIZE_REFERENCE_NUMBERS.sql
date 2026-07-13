-- Database Migration: Standardize Reference Numbers
-- Path: STANDARDIZE_REFERENCE_NUMBERS.sql
--
-- This script:
-- 1. Creates the public.payment_sequences tracking table if it does not exist
-- 2. Sets up proper row-level security (RLS) on payment_sequences
-- 3. Creates/replaces the atomic generate_next_payment_sequence function
-- 4. Ensures reference_number column exists on public.leads and public.customers
-- 5. Backfills any NULL reference_number values in chronological order using the sequence

-- 1. Create table to track receipt sequences per year
CREATE TABLE IF NOT EXISTS public.payment_sequences (
    year INTEGER PRIMARY KEY,
    current_sequence INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on payment_sequences
ALTER TABLE public.payment_sequences ENABLE ROW LEVEL SECURITY;

-- Recreate policy to avoid duplicate object errors
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

-- 3. Add reference_number column to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS reference_number TEXT;

-- 4. Add reference_number column to customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS reference_number TEXT;

-- 5. Backfill existing leads and customers using sequences
DO $$
DECLARE
    lead_rec RECORD;
    cust_rec RECORD;
    seq_val INTEGER;
    ref_num TEXT;
    lead_year INTEGER;
BEGIN
    -- Backfill leads where reference_number is NULL
    FOR lead_rec IN 
        SELECT id, created_at, reference_number 
        FROM public.leads 
        WHERE reference_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        lead_year := COALESCE(EXTRACT(YEAR FROM lead_rec.created_at)::INTEGER, 2026);
        
        -- Increment sequence atomically
        seq_val := public.generate_next_payment_sequence(lead_year);
        
        -- Generate formatted ref number
        ref_num := 'E-' || LPAD(seq_val::text, 3, '0') || '-' || lead_year::text;
        
        -- Update the lead record
        UPDATE public.leads 
        SET reference_number = ref_num 
        WHERE id = lead_rec.id;
        
        -- Propagate reference number to corresponding customer if exists
        UPDATE public.customers 
        SET reference_number = ref_num 
        WHERE lead_id = lead_rec.id;
    END LOOP;

    -- Handle manual customers without leads where reference_number is NULL
    FOR cust_rec IN 
        SELECT id, created_at, reference_number 
        FROM public.customers 
        WHERE reference_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        lead_year := COALESCE(EXTRACT(YEAR FROM cust_rec.created_at)::INTEGER, 2026);
        
        -- Increment sequence atomically
        seq_val := public.generate_next_payment_sequence(lead_year);
        
        -- Generate formatted ref number
        ref_num := 'E-' || LPAD(seq_val::text, 3, '0') || '-' || lead_year::text;
        
        -- Update the customer record
        UPDATE public.customers 
        SET reference_number = ref_num 
        WHERE id = cust_rec.id;
    END LOOP;
END $$;
