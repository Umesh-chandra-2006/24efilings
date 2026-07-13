-- 1. Create table to track receipt sequences per year
CREATE TABLE IF NOT EXISTS public.payment_sequences (
    year INTEGER PRIMARY KEY,
    current_sequence INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.payment_sequences ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform operations through RPC (RPC executes with SECURITY DEFINER, so we don't need excessive policies, but nice to have)
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
    -- Atomic upsert with row locking (SELECT FOR UPDATE equivalent inside INSERT ON CONFLICT)
    INSERT INTO public.payment_sequences (year, current_sequence)
    VALUES (payment_year, 1)
    ON CONFLICT (year)
    DO UPDATE SET current_sequence = public.payment_sequences.current_sequence + 1
    RETURNING current_sequence INTO next_seq;
    
    RETURN next_seq;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
