import React, { useState } from 'react'
import { Card, Button, Typography, Space, Steps, message } from 'antd'
import { ExternalLink, Shield, TrendingUp, CheckCircle } from 'lucide-react'

const { Title, Text, Paragraph } = Typography

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [connecting, setConnecting] = useState(false)

  const handleConnectMeta = async () => {
    setConnecting(true)
    
    try {
      // Aqui construiremos a URL de OAuth do Meta
      const clientId = import.meta.env.VITE_META_APP_ID
      const redirectUri = encodeURIComponent(import.meta.env.VITE_META_REDIRECT_URI)
      const scope = 'ads_read,ads_management'
      
      const metaOAuthUrl = `https://www.facebook.com/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`
      
      window.location.href = metaOAuthUrl
    } catch (error) {
      message.error('Erro ao conectar com o Meta. Tente novamente.')
      setConnecting(false)
    }
  }

  const steps = [
    {
      title: 'Bem-vindo',
      description: 'Configure sua conta para começar'
    },
    {
      title: 'Conectar Meta',
      description: 'Autorize o acesso aos seus anúncios'
    },
    {
      title: 'Pronto!',
      description: 'Comece a analisar seus dados'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Space direction="vertical" size="middle">
            <TrendingUp className="text-blue-600 mx-auto" size={64} />
            <Title level={1} className="!mb-0 text-gray-800">
              Bem-vindo ao Dash Ads BR
            </Title>
            <Text className="text-lg text-gray-600">
              Vamos configurar sua conta em poucos passos
            </Text>
          </Space>
        </div>

        <Card className="shadow-lg mb-6">
          <Steps current={currentStep} items={steps} className="mb-8" />
          
          {currentStep === 0 && (
            <div className="text-center">
              <Title level={3}>Configure sua conta</Title>
              <Paragraph className="text-gray-600 mb-6">
                O Dash Ads BR é um dashboard simplificado para analisar o desempenho 
                dos seus anúncios no Meta (Facebook e Instagram). Acompanhe métricas 
                importantes sem a complexidade do Gerenciador de Anúncios.
              </Paragraph>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="text-blue-600 mx-auto mb-2" size={32} />
                  <Text className="font-semibold block">Métricas Simples</Text>
                  <Text className="text-sm text-gray-600">
                    Gastos, impressões, CTR e conversões
                  </Text>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Shield className="text-green-600 mx-auto mb-2" size={32} />
                  <Text className="font-semibold block">100% Seguro</Text>
                  <Text className="text-sm text-gray-600">
                    Dados protegidos e criptografados
                  </Text>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CheckCircle className="text-purple-600 mx-auto mb-2" size={32} />
                  <Text className="font-semibold block">Fácil de Usar</Text>
                  <Text className="text-sm text-gray-600">
                    Interface intuitiva em português
                  </Text>
                </div>
              </div>
              
              <Button 
                type="primary" 
                size="large"
                onClick={() => setCurrentStep(1)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Começar Configuração
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center">
              <Title level={3}>Conectar com o Meta</Title>
              <Paragraph className="text-gray-600 mb-6">
                Para acessar os dados dos seus anúncios, precisamos conectar sua conta do Meta. 
                Você será redirecionado para autorizar o acesso de forma segura.
              </Paragraph>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <Text className="text-yellow-800 font-medium">
                  ⚠️ Importante: Certifique-se de que você tem acesso às contas de anúncios que deseja monitorar.
                </Text>
              </div>
              
              <Space direction="vertical" size="middle">
                <Button
                  type="primary"
                  size="large"
                  loading={connecting}
                  onClick={handleConnectMeta}
                  icon={<ExternalLink size={16} />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {connecting ? 'Conectando...' : 'Conectar com Meta'}
                </Button>
                
                <Button 
                  type="text" 
                  onClick={() => setCurrentStep(0)}
                >
                  Voltar
                </Button>
              </Space>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}