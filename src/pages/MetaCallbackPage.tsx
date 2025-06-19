import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Typography, Spin, Result, Button } from 'antd'
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

const { Title, Text, Paragraph } = Typography

export const MetaCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleOAuthCallback()
  }, [])

  const handleOAuthCallback = async () => {
    try {
      // Verificar se usuário está autenticado
      if (!user) {
        setError('Usuário não autenticado. Faça login primeiro.')
        setLoading(false)
        return
      }

      // Extrair parâmetros da URL
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')
      const state = searchParams.get('state')

      // Verificar se houve erro na autorização
      if (errorParam) {
        const errorDescription = searchParams.get('error_description') || 'Erro desconhecido'
        setError(`Autorização negada: ${errorDescription}`)
        setLoading(false)
        return
      }

      // Verificar se o código foi fornecido
      if (!code) {
        setError('Código de autorização não encontrado na URL')
        setLoading(false)
        return
      }

      // Obter token de autenticação do Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Sessão expirada. Faça login novamente.')
        setLoading(false)
        return
      }

      // Chamar Edge Function para processar o OAuth
      const { data, error: apiError } = await supabase.functions.invoke('handle-meta-oauth', {
        body: {
          code: code,
          state: state
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (apiError) {
        console.error('Erro na Edge Function:', apiError)
        setError('Falha ao processar autorização do Meta')
        setLoading(false)
        return
      }

      if (!data?.success) {
        setError(data?.error || 'Erro desconhecido ao conectar com Meta')
        setLoading(false)
        return
      }

      // Sucesso!
      setSuccess(true)
      setLoading(false)

      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 2000)

    } catch (err) {
      console.error('Erro no callback OAuth:', err)
      setError('Erro inesperado ao processar autorização')
      setLoading(false)
    }
  }

  const handleRetry = () => {
    navigate('/onboarding', { replace: true })
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <div className="py-8">
            <TrendingUp className="text-blue-600 mx-auto mb-4" size={48} />
            <Title level={3} className="!mb-4">Processando Autorização</Title>
            <Spin size="large" className="mb-4" />
            <Paragraph className="text-gray-600">
              Estamos processando sua autorização com o Meta...
            </Paragraph>
          </div>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <Result
            icon={<CheckCircle className="text-green-600 mx-auto" size={64} />}
            title="Conexão Realizada com Sucesso!"
            subTitle="Sua conta do Meta foi conectada ao Dash Ads BR. Redirecionando para o dashboard..."
            extra={[
              <Button 
                key="dashboard"
                type="primary" 
                onClick={handleGoToDashboard}
                className="bg-green-600 hover:bg-green-700"
              >
                Ir para Dashboard
              </Button>
            ]}
          />
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <Result
            icon={<XCircle className="text-red-600 mx-auto" size={64} />}
            title="Erro na Autorização"
            subTitle={error}
            extra={[
              <Button 
                key="retry"
                type="primary" 
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Tentar Novamente
              </Button>,
              <Button 
                key="dashboard"
                onClick={handleGoToDashboard}
              >
                Ir para Dashboard
              </Button>
            ]}
          />
        </Card>
      </div>
    )
  }

  return null
}