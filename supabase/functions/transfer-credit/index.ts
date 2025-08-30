// Transfer Credit Edge Function
// This function handles the transfer of green hydrogen credits between users

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

interface TransferCreditsRequest {
  creditId: number
  toUserId: string
  volume?: number // For partial transfers
  price?: number // Optional price per unit
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

    const body: TransferCreditsRequest = await req.json()
    const { creditId, toUserId, volume, price } = body

    if (!creditId || !toUserId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: creditId, toUserId' }),
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

    // Verify credit is transferable
    if (credit.status !== 'issued' && credit.status !== 'verified') {
      return new Response(
        JSON.stringify({ error: 'Credit is not in transferable state' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify recipient exists and has appropriate role
    const { data: recipient, error: recipientError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('user_id', toUserId)
      .single()

    if (recipientError || !recipient) {
      return new Response(
        JSON.stringify({ error: 'Recipient user not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify recipient can receive credits (buyers, other producers, etc.)
    if (!['buyer', 'producer', 'regulatory'].includes(recipient.role)) {
      return new Response(
        JSON.stringify({ error: 'Recipient cannot receive credits' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const transferVolume = volume || credit.volume
    
    // Validate transfer volume
    if (transferVolume <= 0 || transferVolume > credit.volume) {
      return new Response(
        JSON.stringify({ error: 'Invalid transfer volume' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // TODO: Integrate with blockchain for actual transfer
    // For now, simulate blockchain interaction
    const mockBlockchainResponse = {
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 17000000,
      gasUsed: Math.floor(Math.random() * 50000) + 21000,
      gasPrice: "20000000000"
    }

    // Handle full vs partial transfer
    let newCreditId = creditId
    
    if (transferVolume < credit.volume) {
      // Partial transfer: create new credit for recipient, update original
      const { data: newCredit, error: newCreditError } = await supabase
        .from('credits')
        .insert({
          user_id: toUserId,
          token_id: `${credit.token_id}_split_${Date.now()}`,
          volume: transferVolume,
          production_method: credit.production_method,
          renewable_source: credit.renewable_source,
          production_facility_id: credit.production_facility_id,
          status: 'transferred',
          certification_body: credit.certification_body,
          verification_date: credit.verification_date,
          expiry_date: credit.expiry_date,
          metadata: {
            ...credit.metadata,
            originalTokenId: credit.token_id,
            splitFrom: creditId,
            transferredAt: new Date().toISOString()
          },
          blockchain_tx_hash: mockBlockchainResponse.transactionHash
        })
        .select()
        .single()

      if (newCreditError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create new credit for recipient' }),
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
          volume: credit.volume - transferVolume,
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId)

      newCreditId = newCredit.id
    } else {
      // Full transfer: update ownership
      await supabase
        .from('credits')
        .update({
          user_id: toUserId,
          status: 'transferred',
          blockchain_tx_hash: mockBlockchainResponse.transactionHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId)
    }

    // Log transaction
    await supabase.from('transactions').insert({
      credit_id: newCreditId,
      from_user_id: user.id,
      to_user_id: toUserId,
      transaction_type: 'transfer',
      volume: transferVolume,
      price_per_unit: price,
      total_amount: price ? price * transferVolume : null,
      blockchain_tx_hash: mockBlockchainResponse.transactionHash,
      block_number: mockBlockchainResponse.blockNumber,
      gas_used: mockBlockchainResponse.gasUsed,
      gas_price: mockBlockchainResponse.gasPrice,
      status: 'confirmed',
      metadata: {
        originalCreditId: creditId,
        isPartialTransfer: transferVolume < credit.volume
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        transferredCreditId: newCreditId,
        transferredVolume: transferVolume,
        remainingVolume: transferVolume < credit.volume ? credit.volume - transferVolume : 0,
        blockchain: mockBlockchainResponse,
        message: 'Credit transferred successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Transfer credit error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
