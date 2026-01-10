-- Create deployed_stores table for Dropyfy hosted stores
CREATE TABLE public.deployed_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  store_data JSONB NOT NULL,
  stripe_connected BOOLEAN DEFAULT false,
  stripe_account_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
  visits INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_deployed_stores_subdomain ON public.deployed_stores(subdomain);
CREATE INDEX idx_deployed_stores_user_id ON public.deployed_stores(user_id);
CREATE INDEX idx_deployed_stores_status ON public.deployed_stores(status);

-- Enable RLS
ALTER TABLE public.deployed_stores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own stores"
ON public.deployed_stores
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stores"
ON public.deployed_stores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores"
ON public.deployed_stores
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stores"
ON public.deployed_stores
FOR DELETE
USING (auth.uid() = user_id);

-- Public read access for subdomain lookup (for public store pages)
CREATE POLICY "Anyone can view active stores by subdomain"
ON public.deployed_stores
FOR SELECT
USING (status = 'active');

-- Add trigger for updated_at
CREATE TRIGGER update_deployed_stores_updated_at
BEFORE UPDATE ON public.deployed_stores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();