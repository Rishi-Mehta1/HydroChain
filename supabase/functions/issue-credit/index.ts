// Issue Credit Edge Function - Hackathon Version
// Simple function to mint green hydrogen credits on blockchain

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ethers } from "https://esm.sh/ethers@6.9.0"

interface IssueCreditsRequest {
  volume: number
  description?: string
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from Authorization header
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

    // Verify user role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || !userRole || userRole.role !== 'producer') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Only producers can issue credits' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const body: IssueCreditsRequest = await req.json()
    const { facilityId, volume, productionMethod, renewableSource, verificationData } = body

    // Validate required fields
    if (!facilityId || !volume || !productionMethod || !renewableSource) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify facility ownership
    const { data: facility, error: facilityError } = await supabase
      .from('production_facilities')
      .select('*')
      .eq('id', facilityId)
      .eq('user_id', user.id)
      .single()

    if (facilityError || !facility) {
      return new Response(
        JSON.stringify({ error: 'Facility not found or not owned by user' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify facility is certified
    if (facility.certification_status !== 'certified') {
      return new Response(
        JSON.stringify({ error: 'Facility must be certified to issue credits' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create credit record in database (status: pending)
    const creditData = {
      user_id: user.id,
      volume: volume,
      production_method: productionMethod,
      renewable_source: renewableSource,
      production_facility_id: facilityId,
      status: 'pending',
      metadata: {
        ...verificationData,
        issuedAt: new Date().toISOString(),
        facilityName: facility.name,
        facilityLocation: facility.location
      }
    }

    const { data: credit, error: creditError } = await supabase
      .from('credits')
      .insert(creditData)
      .select()
      .single()

    if (creditError) {
      console.error('Database error:', creditError)
      return new Response(
        JSON.stringify({ error: 'Failed to create credit record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // TODO: Integrate with blockchain
    // For now, we'll simulate blockchain interaction
    const mockBlockchainResponse = {
      tokenId: `HC_${credit.id}_${Date.now()}`,
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 17000000,
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      gasPrice: "20000000000" // 20 Gwei
    }

    // Update credit with blockchain info
    const { data: updatedCredit, error: updateError } = await supabase
      .from('credits')
      .update({
        token_id: mockBlockchainResponse.tokenId,
        blockchain_tx_hash: mockBlockchainResponse.transactionHash,
        status: 'issued'
      })
      .eq('id', credit.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update credit with blockchain info' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log transaction
    await supabase.from('transactions').insert({
      credit_id: credit.id,
      from_user_id: null, // Mint transaction has no from_user
      to_user_id: user.id,
      transaction_type: 'mint',
      volume: volume,
      blockchain_tx_hash: mockBlockchainResponse.transactionHash,
      block_number: mockBlockchainResponse.blockNumber,
      gas_used: mockBlockchainResponse.gasUsed,
      gas_price: mockBlockchainResponse.gasPrice,
      status: 'confirmed',
      metadata: {
        facilityId: facilityId,
        facilityName: facility.name
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        credit: updatedCredit,
        blockchain: mockBlockchainResponse,
        message: 'Credit issued successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
