-- Add payment_url column for client's personal payment link
ALTER TABLE public.deployed_stores 
ADD COLUMN payment_url TEXT;