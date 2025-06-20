import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, DatePicker, Typography, Table, Space, Spin, Result, Button } from 'antd'
import { TrendingUp, TrendingDown, Eye, MousePointer, Target, DollarSign, AlertCircle, RefreshCw } from 'lucide-react'
import { Line } from '@ant-design/charts'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { useDashboardStore, Campaign, ChartDataPoint, AdAccount } from '../store/dashboardStore'
import { AppLayout } from '../components/Layout/AppLayout'
import { supabase } from '../lib/supabase'
import { message } from 'antd'

dayjs.locale('pt-br')

const { RangePicker } = DatePicker
const { Title } = Typography

export const DashboardPage: React.FC = () => {
  const { 
    selectedAccount, 
    dateRange, 
    setDateRange, 
    metrics, 
    setMetrics, 
    campaigns, 
    setCampaigns,
    loading,
    setLoading,
    chartData,
    setChartData
  } = useDashboardStore()

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedAccount || !dateRange) return

      try {
        setLoading(true)
        setError(null) // Limpar erro anterior
        
        // Obter token de autenticação
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          message.error('Sessão expirada. Faça login novamente.')
          return
        }

        // Formatar datas para o formato YYYY-MM-DD
        const startDate = dateRange[0].format('YYYY-MM-DD')
        const endDate = dateRange[1].format('YYYY-MM-DD')

        // Chamar Edge Function para buscar insights do dashboard
        const { data, error } = await supabase.functions.invoke('get-dashboard-insights', {
          body: {
            ad_account_id: selectedAccount.meta_ad_account_id || selectedAccount.id,
            start_date: startDate,
            end_date: endDate,
            level: 'campaign' // Para buscar dados por campanha também
          },
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        if (error) {
          console.error('Erro ao buscar insights:', error)
          setError('Falha ao carregar os dados do dashboard.')
          message.error('Erro ao carregar dados do dashboard')
          return
        }

        if (!data?.success) {
          setError(data?.error || 'Erro ao carregar dados do dashboard')
          message.error(data?.error || 'Erro ao carregar dados do dashboard')
          return
        }

        // Atualizar estado com os dados recebidos
        const dashboardData = data.data
        
        setMetrics(dashboardData.metrics)
        setCampaigns(dashboardData.campaigns || [])
        setChartData(dashboardData.chart_data || [])

      } catch (error) {
        console.error('Erro inesperado ao buscar dados:', error)
        setError('Falha ao carregar os dados do dashboard.')
        message.error('Erro inesperado ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedAccount, dateRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const chartConfig = {
    data: chartData || [],
    xField: 'date',
    yField: 'spend',
    point: {
      size: 4,
      shape: 'circle',
    },
    smooth: true,
    color: '#1890ff',
    meta: {
      spend: {
        alias: 'Gastos (R$)',
        formatter: (value: number) => formatCurrency(value)
      },
      date: {
        alias: 'Data',
        formatter: (value: string) => dayjs(value).format('DD/MM')
      }
    }
  }

  const columns: ColumnsType<Campaign> = [
    {
      title: 'Campanha',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'Ativa' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      )
    },
    {
      title: 'Gasto',
      dataIndex: 'spend',
      key: 'spend',
      render: (value: number) => formatCurrency(value),
      sorter: (a: Campaign, b: Campaign) => a.spend - b.spend
    },
    {
      title: 'Impressões',
      dataIndex: 'impressions',
      key: 'impressions',
      render: (value: number) => formatNumber(value),
      sorter: (a: Campaign, b: Campaign) => a.impressions - b.impressions
    },
    {
      title: 'Cliques',
      dataIndex: 'clicks',
      key: 'clicks',
      render: (value: number) => formatNumber(value),
      sorter: (a: Campaign, b: Campaign) => a.clicks - b.clicks
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      render: (value: number) => `${value}%`,
      sorter: (a: Campaign, b: Campaign) => a.ctr - b.ctr
    },
    {
      title: 'Conversões',
      dataIndex: 'conversions',
      key: 'conversions',
      render: (value: number) => formatNumber(value),
      sorter: (a: Campaign, b: Campaign) => a.conversions - b.conversions
    }
  ]

  const handleRetry = () => {
    setError(null)
    // Trigger refetch by updating the dateRange slightly
    setDateRange([...dateRange])
  }

  if (!selectedAccount) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="text-gray-400 mx-auto mb-4" size={64} />
            <Title level={3} className="text-gray-600">Selecione uma conta de anúncios</Title>
            <p className="text-gray-500 mb-4">
              Escolha uma conta de anúncios no menu superior para visualizar as métricas.
            </p>
            {!loading && (
              <p className="text-sm text-gray-400">
                Se você não vê nenhuma conta disponível, verifique se conectou sua conta do Meta corretamente.
              </p>
            )}
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error && !loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <Title level={2} className="!mb-1">Dashboard</Title>
              <p className="text-gray-600">
                Dados da conta: <strong>{selectedAccount.name}</strong>
              </p>
            </div>
            
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates)}
              format="DD/MM/YYYY"
              placeholder={['Data inicial', 'Data final']}
              size="large"
              disabled={loading}
            />
          </div>

          <Result
            status="error"
            title="Erro ao Carregar Dados"
            subTitle={error}
            extra={[
              <Button key="retry" type="primary" icon={<RefreshCw size={16} />} onClick={handleRetry}>
                Tentar Novamente
              </Button>
            ]}
          />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header com filtros */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-1">Dashboard</Title>
            <p className="text-gray-600">
              Dados da conta: <strong>{selectedAccount.name}</strong>
            </p>
          </div>
          
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates)}
            format="DD/MM/YYYY"
            placeholder={['Data inicial', 'Data final']}
            size="large"
            disabled={loading}
          />
        </div>

        <Spin spinning={loading}>
          {/* Cards de KPIs */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={4}>
              <Card>
                <Statistic
                  title="Gasto Total"
                  value={metrics?.spend || 0}
                  formatter={(value) => formatCurrency(Number(value))}
                  prefix={<DollarSign className="text-red-500" size={20} />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Card>
                <Statistic
                  title="Impressões"
                  value={metrics?.impressions || 0}
                  formatter={(value) => formatNumber(Number(value))}
                  prefix={<Eye className="text-blue-500" size={20} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Card>
                <Statistic
                  title="Cliques"
                  value={metrics?.clicks || 0}
                  formatter={(value) => formatNumber(Number(value))}
                  prefix={<MousePointer className="text-green-500" size={20} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Card>
                <Statistic
                  title="CTR"
                  value={metrics?.ctr || 0}
                  suffix="%"
                  precision={2}
                  prefix={<TrendingUp className="text-purple-500" size={20} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Card>
                <Statistic
                  title="CPC"
                  value={metrics?.cpc || 0}
                  formatter={(value) => formatCurrency(Number(value))}
                  prefix={<TrendingDown className="text-orange-500" size={20} />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={4}>
              <Card>
                <Statistic
                  title="Conversões"
                  value={metrics?.conversions || 0}
                  formatter={(value) => formatNumber(Number(value))}
                  prefix={<Target className="text-cyan-500" size={20} />}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Gráfico de Performance */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={24}>
              <Card title="Evolução dos Gastos" className="h-96">
                {chartData && chartData.length > 0 ? (
                  <Line {...chartConfig} height={280} />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                      <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Nenhum dado disponível para o período selecionado</p>
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* Tabela de Campanhas */}
          <Row>
            <Col span={24}>
              <Card title="Campanhas Ativas">
                <Table
                  columns={columns}
                  dataSource={campaigns}
                  pagination={{ pageSize: 10, showSizeChanger: true }}
                  size="middle"
                  locale={{ 
                    emptyText: 'Nenhuma campanha encontrada para o período selecionado' 
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    </AppLayout>
  )
}