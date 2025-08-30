// Verify Production Edge Function
// This function handles verification requests and auditor decisions for green hydrogen production

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

interface VerificationRequest {
  action: 'create_request' | 'assign_auditor' | 'submit_decision'
  creditId?: number
  requestType?: string
  priority?: string
  documents?: any[]
  verificationData?: any
  // For assignment
  requestId?: number
  auditorId?: string
  // For decision
  decision?: 'approved' | 'rejected' | 'requires_modification'
  decisionReason?: string
  auditorNotes?: string
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

    // Get user role
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

    const body: VerificationRequest = await req.json()
    const { action } = body

    switch (action) {
      case 'create_request':
        return await handleCreateRequest(supabase, user, userRole.role, body, corsHeaders)
      
      case 'assign_auditor':
        return await handleAssignAuditor(supabase, user, userRole.role, body, corsHeaders)
      
      case 'submit_decision':
        return await handleSubmitDecision(supabase, user, userRole.role, body, corsHeaders)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleCreateRequest(supabase: any, user: any, userRole: string, body: VerificationRequest, corsHeaders: any) {
  const { creditId, requestType, priority, documents, verificationData } = body

  if (!creditId || !requestType) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: creditId, requestType' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Verify user can create verification requests (producers, regulatory)
  if (!['producer', 'regulatory', 'verifier'].includes(userRole)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized to create verification requests' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // If producer, verify credit ownership
  if (userRole === 'producer') {
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
  }

  // Create verification request
  const requestData = {
    credit_id: creditId,
    requester_id: user.id,
    request_type: requestType,
    priority: priority || 'normal',
    documents: documents || [],
    verification_data: verificationData || {},
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  }

  const { data: request, error: requestError } = await supabase
    .from('verification_requests')
    .insert(requestData)
    .select()
    .single()

  if (requestError) {
    return new Response(
      JSON.stringify({ error: 'Failed to create verification request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      request,
      message: 'Verification request created successfully'
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleAssignAuditor(supabase: any, user: any, userRole: string, body: VerificationRequest, corsHeaders: any) {
  const { requestId, auditorId } = body

  if (!requestId || !auditorId) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: requestId, auditorId' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Only regulatory and verifiers can assign auditors
  if (!['regulatory', 'verifier'].includes(userRole)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized to assign auditors' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Verify auditor exists and has correct role
  const { data: auditor, error: auditorError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .eq('user_id', auditorId)
    .single()

  if (auditorError || !auditor || !['auditor', 'regulatory', 'verifier'].includes(auditor.role)) {
    return new Response(
      JSON.stringify({ error: 'Invalid auditor or auditor not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Update verification request
  const { data: updatedRequest, error: updateError } = await supabase
    .from('verification_requests')
    .update({
      auditor_id: auditorId,
      status: 'assigned',
      assigned_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select()
    .single()

  if (updateError || !updatedRequest) {
    return new Response(
      JSON.stringify({ error: 'Failed to assign auditor or request not found' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      request: updatedRequest,
      message: 'Auditor assigned successfully'
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleSubmitDecision(supabase: any, user: any, userRole: string, body: VerificationRequest, corsHeaders: any) {
  const { requestId, decision, decisionReason, auditorNotes } = body

  if (!requestId || !decision || !decisionReason) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: requestId, decision, decisionReason' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Only auditors, regulatory, and verifiers can submit decisions
  if (!['auditor', 'regulatory', 'verifier'].includes(userRole)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized to submit verification decisions' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Get and verify request
  const { data: request, error: requestError } = await supabase
    .from('verification_requests')
    .select('*, credits(*)')
    .eq('id', requestId)
    .single()

  if (requestError || !request) {
    return new Response(
      JSON.stringify({ error: 'Verification request not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Verify auditor is assigned to this request or has authority
  if (request.auditor_id !== user.id && !['regulatory', 'verifier'].includes(userRole)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: not assigned to this request' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Update verification request
  const { data: updatedRequest, error: updateError } = await supabase
    .from('verification_requests')
    .update({
      status: 'completed',
      decision,
      decision_reason: decisionReason,
      auditor_notes: auditorNotes,
      completed_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single()

  if (updateError) {
    return new Response(
      JSON.stringify({ error: 'Failed to update verification request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Update credit status based on decision
  if (decision === 'approved') {
    await supabase
      .from('credits')
      .update({
        status: 'verified',
        verification_date: new Date().toISOString(),
        certification_body: userRole === 'auditor' ? 'Third-party auditor' : 'Regulatory authority'
      })
      .eq('id', request.credit_id)

    // Log verification transaction
    await supabase.from('transactions').insert({
      credit_id: request.credit_id,
      from_user_id: null,
      to_user_id: request.credits.user_id,
      transaction_type: 'verify',
      volume: request.credits.volume,
      blockchain_tx_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      block_number: Math.floor(Math.random() * 1000000) + 17000000,
      gas_used: Math.floor(Math.random() * 30000) + 21000,
      gas_price: "20000000000",
      status: 'confirmed',
      metadata: {
        verificationRequestId: requestId,
        verifiedBy: user.id,
        verifierRole: userRole,
        decision,
        decisionReason
      }
    })
  }

  return new Response(
    JSON.stringify({
      success: true,
      request: updatedRequest,
      creditStatus: decision === 'approved' ? 'verified' : 'pending',
      message: 'Verification decision submitted successfully'
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
