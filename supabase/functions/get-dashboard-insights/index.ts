/*
  # Get Dashboard Insights

  Esta função busca as métricas de performance de uma conta de anúncio específica
  do Meta, permitindo análise detalhada de campanhas e performance.

  ## Funcionalidade
  1. Valida autenticação e permissões do usuário
  2. Busca métricas da Graph API do Meta
  3. Processa e formata dados para o dashboard
  4. Retorna KPIs principais e dados para gráficos

  ## Métricas Incluídas
  - Gastos (spend)
  - Impressões (impressions)
  - Cliques (clicks)
  - CTR (ctr)
  - CPC (cpc)
  - Conversões (actions)

  ## Segurança
  - Validação de propriedade da conta de anúncio
  - Tratamento seguro de access tokens
  - Filtros de data validados
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface InsightsRequest {
  ad_account_id: string
  start_date: string
  end_date: string
  level?: 'account' | 'campaign' | 'adset' | 'ad'
  breakdown?: string[]
}

interface MetricData {
  date_start: string
  date_stop: string
  spend: string
  impressions: string
  clicks: string
  ctr: string
  cpc: string
  actions?: Array<{
    action_type: string
    value: string
  }>
  [key: string]: any
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
    const { ad_account_id, start_date, end_date, level = 'account', breakdown }: InsightsRequest = await req.json()

    if (!ad_account_id || !start_date || !end_date) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios: ad_account_id, start_date, end_date' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return new Response(
        JSON.stringify({ error: 'Formato de data inválido. Use YYYY-MM-DD' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Meta connection for user
    const { data: connection, error: connectionError } = await supabaseClient
      .from('meta_connections')
      .select('id, access_token')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Conexão com Meta não encontrada' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify user has access to this ad account
    const { data: adAccount, error: adAccountError } = await supabaseClient
      .from('ad_accounts_cache')
      .select('id, name')
      .eq('connection_id', connection.id)
      .eq('meta_ad_account_id', ad_account_id)
      .eq('is_active', true)
      .single()

    if (adAccountError || !adAccount) {
      return new Response(
        JSON.stringify({ error: 'Conta de anúncio não encontrada ou sem permissão' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Build Meta API insights URL
    const fields = [
      'spend',
      'impressions', 
      'clicks',
      'ctr',
      'cpc',
      'actions',
      'date_start',
      'date_stop'
    ]

    if (level === 'campaign') {
      fields.push('campaign_id', 'campaign_name')
    }

    const params = new URLSearchParams({
      access_token: connection.access_token,
      fields: fields.join(','),
      time_range: JSON.stringify({
        since: start_date,
        until: end_date
      }),
      level: level,
      limit: '1000'
    })

    if (breakdown && breakdown.length > 0) {
      params.append('breakdowns', breakdown.join(','))
    }

    const insightsUrl = `https://graph.facebook.com/v18.0/${ad_account_id}/insights?${params}`

    // Fetch insights from Meta API
    const insightsResponse = await fetch(insightsUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!insightsResponse.ok) {
      const errorData = await insightsResponse.text()
      console.error('Meta Insights API error:', errorData)
      
      if (insightsResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Token do Meta expirado. Reconecte sua conta.' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Falha ao buscar métricas de insights' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const insightsData = await insightsResponse.json()
    const metrics: MetricData[] = insightsData.data || []

    // Process and aggregate metrics
    let totalSpend = 0
    let totalImpressions = 0
    let totalClicks = 0
    let totalConversions = 0

    const dailyMetrics: { [date: string]: any } = {}

    metrics.forEach(metric => {
      const spend = parseFloat(metric.spend || '0')
      const impressions = parseInt(metric.impressions || '0')
      const clicks = parseInt(metric.clicks || '0')
      const conversions = metric.actions?.find(action => 
        ['purchase', 'lead', 'complete_registration'].includes(action.action_type)
      )?.value || '0'

      totalSpend += spend
      totalImpressions += impressions
      totalClicks += clicks
      totalConversions += parseInt(conversions)

      // Group by date for chart data
      const date = metric.date_start
      if (!dailyMetrics[date]) {
        dailyMetrics[date] = {
          date,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        }
      }

      dailyMetrics[date].spend += spend
      dailyMetrics[date].impressions += impressions
      dailyMetrics[date].clicks += clicks
      dailyMetrics[date].conversions += parseInt(conversions)
    })

    // Calculate derived metrics
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0

    // Format response
    const formattedMetrics = {
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: parseFloat(ctr.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      conversions: totalConversions
    }

    const chartData = Object.values(dailyMetrics).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    )

    // Format campaigns data if level is campaign
    const campaigns = level === 'campaign' ? metrics.map(metric => ({
      key: metric.campaign_id,
      name: metric.campaign_name,
      status: 'Ativa',
      spend: parseFloat(metric.spend || '0'),
      impressions: parseInt(metric.impressions || '0'),
      clicks: parseInt(metric.clicks || '0'),
      ctr: parseFloat(metric.ctr || '0'),
      conversions: metric.actions?.find(action => 
        ['purchase', 'lead', 'complete_registration'].includes(action.action_type)
      )?.value || 0
    })) : []

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          metrics: formattedMetrics,
          chart_data: chartData,
          campaigns: campaigns,
          account: {
            id: ad_account_id,
            name: adAccount.name
          },
          period: {
            start_date,
            end_date
          }
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Get dashboard insights error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})