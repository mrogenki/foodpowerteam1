-- Add email column to receipts table
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS email TEXT;
