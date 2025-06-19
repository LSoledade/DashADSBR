import React from 'react'
import { useEffect } from 'react'
import { Layout, Avatar, Dropdown, Select, Typography, Space } from 'antd'
import { LogOut, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useDashboardStore } from '../../store/dashboardStore'
import { supabase } from '../../lib/supabase'
import { message } from 'antd'

const { Header, Content } = Layout
const { Text } = Typography

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuthStore()
  const { selectedAccount, adAccounts, setSelectedAccount, setAdAccounts, setLoading } = useDashboardStore()

  // Buscar contas de anúncio ao montar o componente
  useEffect(() => {
    const fetchAdAccounts = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Obter token de autenticação
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          message.error('Sessão expirada. Faça login novamente.')
          return
        }

        // Chamar Edge Function para buscar contas de anúncio
        const { data, error } = await supabase.functions.invoke('get-ad-accounts', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        if (error) {
          console.error('Erro ao buscar contas de anúncio:', error)
          message.error('Erro ao carregar contas de anúncio')
          return
        }

        if (!data?.success) {
          message.error(data?.error || 'Erro ao carregar contas de anúncio')
          return
        }

        // Atualizar estado com as contas recebidas
        const accounts = data.data || []
        setAdAccounts(accounts)

        // Se não há conta selecionada e há contas disponíveis, seleciona a primeira
        if (!selectedAccount && accounts.length > 0) {
          setSelectedAccount(accounts[0])
        }

      } catch (error) {
        console.error('Erro inesperado ao buscar contas:', error)
        message.error('Erro inesperado ao carregar contas de anúncio')
      } finally {
        setLoading(false)
      }
    }

    fetchAdAccounts()
  }, [user, setAdAccounts, setSelectedAccount, selectedAccount, setLoading])

  const userMenuItems = [
    {
      key: 'logout',
      label: (
        <Space>
          <LogOut size={16} />
          <span>Sair</span>
        </Space>
      ),
      onClick: signOut
    }
  ]

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-blue-600" size={24} />
            <Text className="text-xl font-bold text-gray-800">Dash Ads BR</Text>
          </div>
          
          {adAccounts.length > 0 && (
            <Select
              placeholder="Selecione uma conta de anúncios"
              value={selectedAccount?.id}
              onChange={(value) => {
                const account = adAccounts.find(acc => acc.id === value)
                setSelectedAccount(account || null)
              }}
              className="min-w-64"
              size="middle"
              loading={adAccounts.length === 0}
            >
              {adAccounts.map(account => (
                <Select.Option key={account.id} value={account.id}>
                  {account.name}
                </Select.Option>
              ))}
            </Select>
          )}
        </div>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar className="cursor-pointer bg-blue-600">
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
        </Dropdown>
      </Header>
      
      <Content className="bg-gray-50">
        {children}
      </Content>
    </Layout>
  )
}