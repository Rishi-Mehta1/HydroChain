-- Minimal Database Schema for Hackathon Green Hydrogen Credit System
-- This replaces the complex schema with just the essentials

-- Drop existing complex tables if they exist
DROP TABLE IF EXISTS public.iot_data CASCADE;
DROP TABLE IF EXISTS public.production_facilities CASCADE;
DROP TABLE IF EXISTS public.verification_requests CASCADE;
DROP TABLE IF EXISTS public.audit_trail CASCADE;
DROP TABLE IF EXISTS public.market_orders CASCADE;

-- Simple Credits Table (for off-chain metadata, linked to blockchain token IDs)
DROP TABLE IF EXISTS public.credits CASCADE;
CREATE TABLE IF NOT EXISTS public.credits (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_id TEXT UNIQUE,  -- Blockchain token ID
  volume DECIMAL(15,6) NOT NULL CHECK (volume > 0),  -- kg of hydrogen
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'transferred', 'retired')),
  metadata JSONB DEFAULT '{}',  -- Simple metadata
  blockchain_tx_hash TEXT,  -- Transaction hash
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simple Transactions Table (for logging transfers/retirements)
DROP TABLE IF EXISTS public.transactions CASCADE;
CREATE TABLE IF NOT EXISTS public.transactions (
  id SERIAL PRIMARY KEY,
  credit_id INTEGER REFERENCES public.credits(id) ON DELETE CASCADE,
  from_user UUID REFERENCES auth.users(id),
  to_user UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('issue', 'transfer', 'retire')),
  volume DECIMAL(15,6) NOT NULL CHECK (volume > 0),
  tx_hash TEXT NOT NULL,  -- Blockchain transaction hash
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Credits
CREATE POLICY "Producers can manage their credits" ON public.credits
  FOR ALL USING (
    auth.uid() = user_id 
    AND (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'producer'
  );

CREATE POLICY "Buyers can view/transfer credits" ON public.credits
  FOR SELECT USING (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('buyer', 'auditor')
  );

CREATE POLICY "Auditors can view all credits" ON public.credits
  FOR SELECT USING (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'auditor'
  );

-- RLS Policies for Transactions
CREATE POLICY "Users can view their transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = from_user OR auth.uid() = to_user
  );

CREATE POLICY "System can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);  -- Edge functions will handle this

CREATE POLICY "Auditors can view all transactions" ON public.transactions
  FOR SELECT USING (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'auditor'
  );

-- Create indexes for performance
CREATE INDEX idx_credits_user_id ON public.credits(user_id);
CREATE INDEX idx_credits_status ON public.credits(status);
CREATE INDEX idx_credits_token_id ON public.credits(token_id);
CREATE INDEX idx_transactions_credit_id ON public.transactions(credit_id);
CREATE INDEX idx_transactions_users ON public.transactions(from_user, to_user);

-- Updated_at trigger for credits
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON public.credits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
