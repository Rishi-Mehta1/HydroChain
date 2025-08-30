-- Enable Credit Purchase Functionality
-- This migration adds RLS policies to allow buyers to purchase credits from producers

-- Add policy to allow buyers to update credits they are purchasing
-- This allows changing ownership and status during purchase transactions
CREATE POLICY "Buyers can purchase available credits" ON public.credits
  FOR UPDATE USING (
    -- Credit must be available for purchase
    status IN ('issued', 'verified') 
    AND
    -- User must be a buyer or auditor (buyers can purchase, auditors can facilitate)
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('buyer', 'auditor', 'regulatory', 'verifier')
    AND
    -- Cannot purchase your own credits
    auth.uid() != user_id
  )
  WITH CHECK (
    -- After purchase, credit should be owned by the buyer
    auth.uid() = user_id
    AND
    -- Status should be updated to 'owned' after purchase
    status = 'owned'
  );

-- Add policy to allow users to insert transaction records
-- This is needed for recording purchase transactions
CREATE POLICY "Users can record transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    -- User can record transactions where they are either sender or receiver
    auth.uid() = from_user OR auth.uid() = to_user
  );

-- Create a function to update user portfolio summary
-- This will track user purchase statistics
CREATE OR REPLACE FUNCTION public.update_user_portfolio_summary(
  user_id UUID,
  credits_purchased INTEGER DEFAULT 0,
  volume_purchased DECIMAL DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- For now, just return a success message
  -- In a full implementation, this would update a portfolio_summary table
  result := json_build_object(
    'success', true,
    'user_id', user_id,
    'credits_purchased', credits_purchased,
    'volume_purchased', volume_purchased,
    'updated_at', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_portfolio_summary TO authenticated;

-- Comment to document what this migration does
COMMENT ON POLICY "Buyers can purchase available credits" ON public.credits 
IS 'Allows authenticated buyers to purchase available credits from other users by updating ownership and status';

COMMENT ON POLICY "Users can record transactions" ON public.transactions 
IS 'Allows users to record transaction history when they are involved in credit transfers';

COMMENT ON FUNCTION public.update_user_portfolio_summary 
IS 'Updates user portfolio statistics after credit purchases (placeholder implementation)';
