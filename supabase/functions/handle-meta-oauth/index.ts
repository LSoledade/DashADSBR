/*
  # Handle Meta OAuth Callback

  Esta função processa o callback do OAuth do Meta, troca o código temporário
  pelo access_token de longa duração e salva de forma segura no banco de dados.

  ## Funcionalidade
  1. Recebe o código OAuth do Meta
  2. Troca o código pelo access_token na API do Meta
  3. Busca informações do usuário Meta
  4. Salva a conexão no banco de dados Supabase

  ## Segurança
  - Client secret do Meta nunca é exposto no frontend
  - Access tokens são armazenados de forma segura
  - Validação de usuário autenticado
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface OAuthRequest {
  code: string
  state?: string
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autorizado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const { code, state }: OAuthRequest = await req.json()

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Código OAuth é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Meta OAuth configuration
    const clientId = Deno.env.get('META_APP_ID')
    const clientSecret = Deno.env.get('META_APP_SECRET')
    const redirectUri = Deno.env.get('META_REDIRECT_URI')

    if (!clientId || !clientSecret || !redirectUri) {
      return new Response(
        JSON.stringify({ error: 'Configuração do Meta incompleta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Exchange code for access token
    const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token'
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
    })

    const tokenResponse = await fetch(`${tokenUrl}?${tokenParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Meta token exchange failed:', errorData)
      return new Response(
        JSON.stringify({ error: 'Falha na autenticação com Meta' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Token de acesso não recebido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Meta user information
    const userInfoUrl = `https://graph.facebook.com/v18.0/me?access_token=${accessToken}&fields=id,name`
    const userInfoResponse = await fetch(userInfoUrl)

    if (!userInfoResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Falha ao obter informações do usuário Meta' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const metaUser = await userInfoResponse.json()

    // Check if connection already exists
    const { data: existingConnection } = await supabaseClient
      .from('meta_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('meta_user_id', metaUser.id)
      .single()

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabaseClient
        .from('meta_connections')
        .update({
          access_token: accessToken,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConnection.id)

      if (updateError) {
        console.error('Failed to update connection:', updateError)
        return new Response(
          JSON.stringify({ error: 'Falha ao atualizar conexão' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } else {
      // Create new connection
      const { error: insertError } = await supabaseClient
        .from('meta_connections')
        .insert({
          user_id: user.id,
          meta_user_id: metaUser.id,
          access_token: accessToken,
        })

      if (insertError) {
        console.error('Failed to save connection:', insertError)
        return new Response(
          JSON.stringify({ error: 'Falha ao salvar conexão' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Conexão com Meta realizada com sucesso',
        meta_user: {
          id: metaUser.id,
          name: metaUser.name,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('OAuth handler error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})