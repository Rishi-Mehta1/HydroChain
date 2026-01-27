-- FIXED Consolidated SQL for HydroChain Reset

-- 1. CLEANUP
DROP TABLE IF EXISTS public.iot_data CASCADE;
DROP TABLE IF EXISTS public.production_facilities CASCADE;
DROP TABLE IF EXISTS public.verification_requests CASCADE;
DROP TABLE IF EXISTS public.audit_trail CASCADE;
DROP TABLE IF EXISTS public.market_orders CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.credits CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 2. CREATE USER ROLES (Must be first for RLS checks)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'producer', 'auditor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. CREATE CREDITS
CREATE TABLE IF NOT EXISTS public.credits (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_id TEXT UNIQUE,
  volume DECIMAL(15,6) NOT NULL CHECK (volume > 0),
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'transferred', 'retired')),
  metadata JSONB DEFAULT '{}',
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- 4. CREATE TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id SERIAL PRIMARY KEY,
  credit_id INTEGER REFERENCES public.credits(id) ON DELETE CASCADE,
  from_user UUID REFERENCES auth.users(id),
  to_user UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('issue', 'transfer', 'retire')),
  volume DECIMAL(15,6) NOT NULL CHECK (volume > 0),
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES

-- User Roles Policies
CREATE POLICY "Users can insert their own role" ON user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own role" ON user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own role" ON user_roles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow service role full access" ON user_roles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow signup role insertion" ON user_roles FOR INSERT TO anon WITH CHECK (true);

-- Credits Policies
CREATE POLICY "Producers can manage their credits" ON public.credits FOR ALL USING (auth.uid() = user_id AND (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'producer');
CREATE POLICY "Buyers can view/transfer credits" ON public.credits FOR SELECT USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('buyer', 'auditor'));
CREATE POLICY "Auditors can view all credits" ON public.credits FOR SELECT USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'auditor');

-- Transactions Policies
CREATE POLICY "Users can view their transactions" ON public.transactions FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_user);
CREATE POLICY "System can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Auditors can view all transactions" ON public.transactions FOR SELECT USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'auditor');

-- 6. TRIGGERS & FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
