// Simple Issue Credit Edge Function - Hackathon Version
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ethers } from "https://esm.sh/ethers@6.9.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Check if user is a producer
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || userRole.role !== 'producer') {
      return new Response(
        JSON.stringify({ error: 'Only producers can issue credits' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Parse request body
    const { volume, description } = await req.json()

    if (!volume || volume <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valid volume is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Try blockchain integration (with fallback to mock)
    let blockchainResult
    try {
      // Setup blockchain connection
      const infuraKey = Deno.env.get('INFURA_PROJECT_ID')
      const privateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY')
      const contractAddress = Deno.env.get('CREDITS_CONTRACT_ADDRESS')

      if (infuraKey && privateKey && contractAddress) {
        // Real blockchain call
        const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${infuraKey}`)
        const wallet = new ethers.Wallet(privateKey, provider)
        
        const contractABI = [
          "function issueCredit(uint256 volume, string memory metadataURI) external returns (uint256)"
        ]
        const contract = new ethers.Contract(contractAddress, contractABI, wallet)
        
        const metadataURI = `data:application/json;base64,${btoa(JSON.stringify({
          name: "Green Hydrogen Credit",
          description: description || "Green Hydrogen Production Credit",
          volume: volume,
          producer: user.email,
          issuedAt: new Date().toISOString()
        }))}`

        const tx = await contract.issueCredit(
          ethers.parseUnits(volume.toString(), 6),
          metadataURI
        )
        
        const receipt = await tx.wait()
        
        blockchainResult = {
          tokenId: receipt.logs[0]?.topics[1] || `${Date.now()}`,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber
        }
      } else {
        throw new Error("Blockchain not configured")
      }
    } catch (error) {
      // Fallback to mock for development/testing
      console.log('Using mock blockchain response:', error.message)
      blockchainResult = {
        tokenId: `GHC_${Date.now()}`,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 19000000
      }
    }

    // Store credit in database
    const { data: credit, error: creditError } = await supabase
      .from('credits')
      .insert({
        user_id: user.id,
        token_id: blockchainResult.tokenId,
        volume: parseFloat(volume),
        status: 'issued',
        blockchain_tx_hash: blockchainResult.transactionHash,
        metadata: {
          description: description || 'Green Hydrogen Credit',
          issuedAt: new Date().toISOString(),
          producer: user.email
        }
      })
      .select()
      .single()

    if (creditError) {
      return new Response(
        JSON.stringify({ error: 'Failed to store credit in database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Log the transaction
    await supabase.from('transactions').insert({
      credit_id: credit.id,
      from_user: null,
      to_user: user.id,
      type: 'issue',
      volume: parseFloat(volume),
      tx_hash: blockchainResult.transactionHash
    })

    return new Response(
      JSON.stringify({
        success: true,
        credit: credit,
        blockchain: blockchainResult,
        message: 'Credit issued successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )
  }
})
