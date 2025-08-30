// Retire Credit Edge Function
// This function handles the retirement of green hydrogen credits to prevent double-counting

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

interface RetireCreditsRequest {
  creditId: number
  volume?: number // For partial retirement
  retirementReason: string
  complianceProject?: string
  beneficiary?: string
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const body: RetireCreditsRequest = await req.json()
    const { creditId, volume, retirementReason, complianceProject, beneficiary } = body

    if (!creditId || !retirementReason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: creditId, retirementReason' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify credit ownership
    const { data: credit, error: creditError } = await supabase
      .from('credits')
      .select('*')
      .eq('id', creditId)
      .eq('user_id', user.id)
      .single()

    if (creditError || !credit) {
      return new Response(
        JSON.stringify({ error: 'Credit not found or not owned by user' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify credit can be retired
    if (credit.status === 'retired') {
      return new Response(
        JSON.stringify({ error: 'Credit is already retired' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!['issued', 'verified', 'transferred'].includes(credit.status)) {
      return new Response(
        JSON.stringify({ error: 'Credit is not in a retirable state' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const retireVolume = volume || credit.volume

    // Validate retirement volume
    if (retireVolume <= 0 || retireVolume > credit.volume) {
      return new Response(
        JSON.stringify({ error: 'Invalid retirement volume' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user role for validation
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || !userRole) {
      return new Response(
        JSON.stringify({ error: 'User role not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // TODO: Integrate with blockchain for actual retirement
    // For now, simulate blockchain interaction
    const mockBlockchainResponse = {
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 17000000,
      gasUsed: Math.floor(Math.random() * 40000) + 21000,
      gasPrice: "20000000000"
    }

    // Generate retirement certificate ID
    const retirementCertificateId = `RC_${creditId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    // Handle partial vs full retirement
    if (retireVolume < credit.volume) {
      // Partial retirement: create new retired credit entry, update original
      const { data: retiredCredit, error: retiredCreditError } = await supabase
        .from('credits')
        .insert({
          user_id: user.id,
          token_id: `${credit.token_id}_retired_${Date.now()}`,
          volume: retireVolume,
          production_method: credit.production_method,
          renewable_source: credit.renewable_source,
          production_facility_id: credit.production_facility_id,
          status: 'retired',
          certification_body: credit.certification_body,
          verification_date: credit.verification_date,
          expiry_date: credit.expiry_date,
          metadata: {
            ...credit.metadata,
            originalTokenId: credit.token_id,
            retiredFrom: creditId,
            retirementReason,
            complianceProject,
            beneficiary,
            retiredAt: new Date().toISOString(),
            retirementCertificateId,
            retiredBy: user.id,
            retiredByRole: userRole.role
          },
          blockchain_tx_hash: mockBlockchainResponse.transactionHash
        })
        .select()
        .single()

      if (retiredCreditError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create retired credit record' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Update original credit volume
      await supabase
        .from('credits')
        .update({ 
          volume: credit.volume - retireVolume,
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId)

    } else {
      // Full retirement: update status
      await supabase
        .from('credits')
        .update({
          status: 'retired',
          blockchain_tx_hash: mockBlockchainResponse.transactionHash,
          metadata: {
            ...credit.metadata,
            retirementReason,
            complianceProject,
            beneficiary,
            retiredAt: new Date().toISOString(),
            retirementCertificateId,
            retiredBy: user.id,
            retiredByRole: userRole.role
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId)
    }

    // Log retirement transaction
    await supabase.from('transactions').insert({
      credit_id: creditId,
      from_user_id: user.id,
      to_user_id: null, // Retirement has no recipient
      transaction_type: 'retire',
      volume: retireVolume,
      blockchain_tx_hash: mockBlockchainResponse.transactionHash,
      block_number: mockBlockchainResponse.blockNumber,
      gas_used: mockBlockchainResponse.gasUsed,
      gas_price: mockBlockchainResponse.gasPrice,
      status: 'confirmed',
      metadata: {
        retirementReason,
        complianceProject,
        beneficiary,
        retirementCertificateId,
        isPartialRetirement: retireVolume < credit.volume,
        retiredByRole: userRole.role
      }
    })

    // Generate retirement certificate data
    const retirementCertificate = {
      certificateId: retirementCertificateId,
      creditId: creditId,
      tokenId: credit.token_id,
      volume: retireVolume,
      retiredBy: user.id,
      retiredByRole: userRole.role,
      retirementReason,
      complianceProject,
      beneficiary,
      retiredAt: new Date().toISOString(),
      productionMethod: credit.production_method,
      renewableSource: credit.renewable_source,
      facilityId: credit.production_facility_id,
      blockchainTxHash: mockBlockchainResponse.transactionHash,
      blockNumber: mockBlockchainResponse.blockNumber
    }

    return new Response(
      JSON.stringify({
        success: true,
        retiredVolume: retireVolume,
        remainingVolume: retireVolume < credit.volume ? credit.volume - retireVolume : 0,
        retirementCertificate,
        blockchain: mockBlockchainResponse,
        message: 'Credit retired successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Retire credit error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
