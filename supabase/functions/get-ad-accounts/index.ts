/*
  # Get Ad Accounts

  Esta função busca as contas de anúncio do Meta associadas ao usuário autenticado,
  utilizando o access_token salvo de forma segura no banco de dados.

  ## Funcionalidade
  1. Valida autenticação do usuário
  2. Busca o access_token do Meta no banco
  3. Faz chamada para Graph API do Meta
  4. Retorna lista das contas de anúncio disponíveis
  5. Salva/atualiza cache das contas no banco

  ## Segurança
  - Apenas usuários autenticados podem acessar
  - Access tokens nunca são expostos no response
  - Cache otimizado para reduzir chamadas à API
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface AdAccount {
  id: string
  name: string
  account_status: number
  currency: string
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (req.method !== 'GET') {
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

    // Get Meta connection for user
    const { data: connection, error: connectionError } = await supabaseClient
      .from('meta_connections')
      .select('id, access_token, meta_user_id')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Conexão com Meta não encontrada. Conecte sua conta primeiro.' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch ad accounts from Meta API
    const adAccountsUrl = `https://graph.facebook.com/v18.0/me/adaccounts?access_token=${connection.access_token}&fields=id,name,account_status,currency`
    
    const adAccountsResponse = await fetch(adAccountsUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!adAccountsResponse.ok) {
      const errorData = await adAccountsResponse.text()
      console.error('Meta API error:', errorData)
      
      // Check if token is expired
      if (adAccountsResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Token do Meta expirado. Reconecte sua conta.' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Falha ao buscar contas de anúncio' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const adAccountsData = await adAccountsResponse.json()
    const adAccounts: AdAccount[] = adAccountsData.data || []

    // Filter only active accounts
    const activeAccounts = adAccounts.filter(account => account.account_status === 1)

    // Update cache in database
    if (activeAccounts.length > 0) {
      // First, mark all existing accounts as inactive
      await supabaseClient
        .from('ad_accounts_cache')
        .update({ is_active: false })
        .eq('connection_id', connection.id)

      // Insert or update each account
      for (const account of activeAccounts) {
        const { error: upsertError } = await supabaseClient
          .from('ad_accounts_cache')
          .upsert({
            connection_id: connection.id,
            meta_ad_account_id: account.id,
            name: account.name,
            is_active: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'connection_id,meta_ad_account_id'
          })

        if (upsertError) {
          console.error('Failed to cache ad account:', upsertError)
        }
      }
    }

    // Format response
    const formattedAccounts = activeAccounts.map(account => ({
      id: account.id,
      name: account.name,
      currency: account.currency || 'BRL',
      meta_ad_account_id: account.id,
    }))

    return new Response(
      JSON.stringify({ 
        success: true,
        data: formattedAccounts,
        total: formattedAccounts.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Get ad accounts error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})