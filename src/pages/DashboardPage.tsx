import React, { useEffect } from 'react'
import { Row, Col, Card, Statistic, DatePicker, Typography, Table, Space, Spin } from 'antd'
import { TrendingUp, TrendingDown, Eye, MousePointer, Target, DollarSign } from 'lucide-react'
import { Line } from '@ant-design/charts'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { useDashboardStore } from '../store/dashboardStore'
import { AppLayout } from '../components/Layout/AppLayout'

dayjs.locale('pt-br')

const { RangePicker } = DatePicker
const { Title } = Typography

// Dados mock para desenvolvimento
const mockMetrics = {
  spend: 1245.67,
  impressions: 45678,
  clicks: 1234,
  ctr: 2.7,
  cpc: 1.01,
  conversions: 87
}

const mockChartData = [
  { date: '2024-01-01', gastos: 123.45, conversoes: 8 },
  { date: '2024-01-02', gastos: 165.32, conversoes: 12 },
  { date: '2024-01-03', gastos: 198.76, conversoes: 15 },
  { date: '2024-01-04', gastos: 142.89, conversoes: 9 },
  { date: '2024-01-05', gastos: 234.12, conversoes: 18 },
  { date: '2024-01-06', gastos: 187.55, conversoes: 14 },
  { date: '2024-01-07', gastos: 213.44, conversoes: 16 }
]

const mockCampaigns = [
  {
    key: '1',
    name: 'Campanha Black Friday 2024',
    status: 'Ativa',
    spend: 456.78,
    impressions: 12345,
    clicks: 234,
    ctr: 1.9,
    conversions: 15
  },
  {
    key: '2',
    name: 'Promoção Verão - Produtos',
    status: 'Ativa',
    spend: 321.45,
    impressions: 8976,
    clicks: 167,
    ctr: 1.86,
    conversions: 9
  },
  {
    key: '3',
    name: 'Retargeting Site',
    status: 'Ativa',
    spend: 234.56,
    impressions: 15432,
    clicks: 456,
    ctr: 2.95,
    conversions: 23
  }
]

export const DashboardPage: React.FC = () => {
  const { 
    selectedAccount, 
    dateRange, 
    setDateRange, 
    metrics, 
    setMetrics, 
    campaigns, 
    setCampaigns,
    loading 
  } = useDashboardStore()

  useEffect(() => {
    // Simular carregamento de dados
    setMetrics(mockMetrics)
    setCampaigns(mockCampaigns)
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
    data: mockChartData,
    xField: 'date',
    yField: 'gastos',
    point: {
      size: 4,
      shape: 'circle',
    },
    smooth: true,
    color: '#1890ff',
    meta: {
      gastos: {
        alias: 'Gastos (R$)',
        formatter: (value: number) => formatCurrency(value)
      },
      date: {
        alias: 'Data',
        formatter: (value: string) => dayjs(value).format('DD/MM')
      }
    }
  }

  const columns = [
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
      sorter: (a: any, b: any) => a.spend - b.spend
    },
    {
      title: 'Impressões',
      dataIndex: 'impressions',
      key: 'impressions',
      render: (value: number) => formatNumber(value),
      sorter: (a: any, b: any) => a.impressions - b.impressions
    },
    {
      title: 'Cliques',
      dataIndex: 'clicks',
      key: 'clicks',
      render: (value: number) => formatNumber(value),
      sorter: (a: any, b: any) => a.clicks - b.clicks
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      render: (value: number) => `${value}%`,
      sorter: (a: any, b: any) => a.ctr - b.ctr
    },
    {
      title: 'Conversões',
      dataIndex: 'conversions',
      key: 'conversions',
      render: (value: number) => formatNumber(value),
      sorter: (a: any, b: any) => a.conversions - b.conversions
    }
  ]

  if (!selectedAccount) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <Title level={3}>Selecione uma conta de anúncios</Title>
          <p className="text-gray-600">
            Escolha uma conta de anúncios no menu superior para visualizar as métricas.
          </p>
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
                <Line {...chartConfig} height={280} />
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
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    </AppLayout>
  )
}