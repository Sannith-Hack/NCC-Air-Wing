-- Drop the helper functions for encryption/decryption
DROP FUNCTION IF EXISTS public.encrypt_sensitive_data(text);
DROP FUNCTION IF EXISTS public.decrypt_sensitive_data(bytea);

-- Drop the encrypted columns from the students table
ALTER TABLE public.students 
DROP COLUMN IF EXISTS aadhaar_encrypted,
DROP COLUMN IF EXISTS pan_encrypted,
DROP COLUMN IF EXISTS account_number_encrypted;