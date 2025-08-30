-- Enhanced Database Schema for Green Hydrogen Credit System
-- This migration creates comprehensive tables for managing credits, transactions, production facilities, and verifications

-- Credits Table (for off-chain metadata, linked to blockchain token IDs)
CREATE TABLE IF NOT EXISTS public.credits (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_id TEXT UNIQUE,  -- Blockchain token ID (nullable until minted)
  volume DECIMAL(15,6) NOT NULL CHECK (volume > 0),  -- kg of hydrogen
  production_method TEXT NOT NULL CHECK (production_method IN ('electrolysis', 'biogas_reforming', 'thermochemical')),
  renewable_source TEXT NOT NULL CHECK (renewable_source IN ('solar', 'wind', 'hydro', 'geothermal', 'biomass', 'mixed')),
  production_facility_id INTEGER REFERENCES public.production_facilities(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'issued', 'transferred', 'retired')),
  certification_body TEXT,
  verification_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',  -- Additional production metadata
  blockchain_tx_hash TEXT,  -- Transaction hash of minting/transfer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production Facilities Table
CREATE TABLE IF NOT EXISTS public.production_facilities (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity_mw DECIMAL(10,2) NOT NULL CHECK (capacity_mw > 0),  -- Megawatts capacity
  renewable_sources TEXT[] NOT NULL,  -- Array of renewable sources
  certification_status TEXT NOT NULL DEFAULT 'pending' CHECK (certification_status IN ('pending', 'certified', 'suspended', 'revoked')),
  certifying_body TEXT,
  certification_date TIMESTAMPTZ,
  coordinates POINT,  -- Geographic coordinates
  iot_device_ids TEXT[],  -- Array of connected IoT device identifiers
  operational_since DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table (for logging all credit operations)
CREATE TABLE IF NOT EXISTS public.transactions (
  id SERIAL PRIMARY KEY,
  credit_id INTEGER REFERENCES public.credits(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mint', 'transfer', 'retire', 'verify')),
  volume DECIMAL(15,6),  -- Volume involved in transaction
  price_per_unit DECIMAL(10,2),  -- Price per kg (optional)
  total_amount DECIMAL(15,2),  -- Total transaction amount
  blockchain_tx_hash TEXT NOT NULL,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price DECIMAL(20,0),  -- Wei
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Requests Table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id SERIAL PRIMARY KEY,
  credit_id INTEGER REFERENCES public.credits(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  auditor_id UUID REFERENCES auth.users(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('initial_verification', 're_verification', 'compliance_check')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'rejected')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  documents JSONB DEFAULT '[]',  -- Array of document references
  verification_data JSONB DEFAULT '{}',  -- IoT data, measurements, etc.
  auditor_notes TEXT,
  decision TEXT CHECK (decision IN ('approved', 'rejected', 'requires_modification')),
  decision_reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ
);

-- IoT Data Table (for storing sensor data from production facilities)
CREATE TABLE IF NOT EXISTS public.iot_data (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES public.production_facilities(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('energy_input', 'hydrogen_output', 'efficiency', 'temperature', 'pressure', 'purity')),
  value DECIMAL(15,6) NOT NULL,
  unit TEXT NOT NULL,
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),  -- Data quality indicator
  timestamp TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Trail Table (for comprehensive logging)
CREATE TABLE IF NOT EXISTS public.audit_trail (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Market Orders Table (for credit trading)
CREATE TABLE IF NOT EXISTS public.market_orders (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('buy', 'sell')),
  credit_id INTEGER REFERENCES public.credits(id),
  volume DECIMAL(15,6) NOT NULL CHECK (volume > 0),
  price_per_unit DECIMAL(10,2) NOT NULL CHECK (price_per_unit > 0),
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount > 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partial', 'filled', 'cancelled', 'expired')),
  filled_volume DECIMAL(15,6) DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Credits
CREATE POLICY "Users can view their own credits" ON public.credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Producers can manage their credits" ON public.credits
  FOR ALL USING (
    auth.uid() = user_id 
    AND (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'producer'
  );

CREATE POLICY "Buyers can view available credits" ON public.credits
  FOR SELECT USING (
    status IN ('issued', 'verified') 
    AND (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('buyer', 'auditor', 'regulatory', 'verifier')
  );

CREATE POLICY "Auditors can view and verify credits" ON public.credits
  FOR SELECT USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('auditor', 'regulatory', 'verifier'));

CREATE POLICY "Auditors can update verification status" ON public.credits
  FOR UPDATE USING (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('auditor', 'regulatory', 'verifier')
  );

-- RLS Policies for Production Facilities
CREATE POLICY "Users can manage their own facilities" ON public.production_facilities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Auditors can view all facilities" ON public.production_facilities
  FOR SELECT USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('auditor', 'regulatory', 'verifier'));

-- RLS Policies for Transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Auditors can view all transactions" ON public.transactions
  FOR SELECT USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('auditor', 'regulatory', 'verifier'));

-- RLS Policies for Verification Requests
CREATE POLICY "Requesters can manage their requests" ON public.verification_requests
  FOR ALL USING (auth.uid() = requester_id);

CREATE POLICY "Auditors can view and update assigned requests" ON public.verification_requests
  FOR ALL USING (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('auditor', 'regulatory', 'verifier')
  );

-- RLS Policies for IoT Data
CREATE POLICY "Facility owners can manage IoT data" ON public.iot_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.production_facilities 
      WHERE id = facility_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Auditors can view IoT data" ON public.iot_data
  FOR SELECT USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('auditor', 'regulatory', 'verifier'));

-- RLS Policies for Market Orders
CREATE POLICY "Users can manage their own orders" ON public.market_orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "All users can view open orders" ON public.market_orders
  FOR SELECT USING (status = 'open');

-- Create indexes for better performance
CREATE INDEX idx_credits_user_id ON public.credits(user_id);
CREATE INDEX idx_credits_status ON public.credits(status);
CREATE INDEX idx_credits_token_id ON public.credits(token_id);
CREATE INDEX idx_transactions_credit_id ON public.transactions(credit_id);
CREATE INDEX idx_transactions_users ON public.transactions(from_user_id, to_user_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX idx_iot_data_facility_timestamp ON public.iot_data(facility_id, timestamp);
CREATE INDEX idx_market_orders_status ON public.market_orders(status);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON public.credits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_facilities_updated_at BEFORE UPDATE ON public.production_facilities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_orders_updated_at BEFORE UPDATE ON public.market_orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trail trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_trail (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_trail (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_trail (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers to key tables
CREATE TRIGGER audit_credits AFTER INSERT OR UPDATE OR DELETE ON public.credits
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_verification_requests AFTER INSERT OR UPDATE OR DELETE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
