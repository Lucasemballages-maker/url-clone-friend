-- Add stripe_api_key column for client's Stripe secret key (encrypted storage recommended)
ALTER TABLE public.deployed_stores 
ADD COLUMN stripe_api_key TEXT;