-- Add pan_number to leads and customres tables
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pan_number TEXT;

-- We don't drop whatsapp_number immediately to preserve data just in case, 
-- but we will stop using it in the application.
-- If strict replacement is needed:
-- ALTER TABLE leads DROP COLUMN whatsapp_number;
-- ALTER TABLE customers DROP COLUMN whatsapp_number;
