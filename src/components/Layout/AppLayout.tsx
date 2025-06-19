import React from 'react'
import { Layout, Avatar, Dropdown, Select, Typography, Space } from 'antd'
import { LogOut, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useDashboardStore } from '../../store/dashboardStore'

const { Header, Content } = Layout
const { Text } = Typography

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuthStore()
  const { selectedAccount, adAccounts, setSelectedAccount } = useDashboardStore()

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