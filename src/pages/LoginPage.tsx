import React, { useState } from 'react'
import { Card, Form, Input, Button, Typography, message, Space } from 'antd'
import { Mail, Lock, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'

const { Title, Text } = Typography

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (values: { email: string; password: string; name?: string }) => {
    setLoading(true)
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.name
            }
          }
        })
        
        if (error) throw error
        message.success('Conta criada com sucesso! Verifique seu email.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password
        })
        
        if (error) throw error
        message.success('Login realizado com sucesso!')
      }
    } catch (error: any) {
      message.error(error.message || 'Erro ao realizar autenticação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Space direction="vertical" size="small">
            <TrendingUp className="text-blue-600 mx-auto" size={48} />
            <Title level={2} className="!mb-0 text-gray-800">Dash Ads BR</Title>
            <Text className="text-gray-600">
              Dashboard inteligente para seus anúncios do Meta
            </Text>
          </Space>
        </div>

        <Card className="shadow-lg">
          <Title level={3} className="text-center !mb-6">
            {isSignUp ? 'Criar Conta' : 'Fazer Login'}
          </Title>

          <Form
            name="auth"
            onFinish={handleAuth}
            layout="vertical"
            size="large"
          >
            {isSignUp && (
              <Form.Item
                name="name"
                label="Nome Completo"
                rules={[{ required: true, message: 'Por favor, insira seu nome' }]}
              >
                <Input placeholder="Seu nome completo" />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Por favor, insira seu email' },
                { type: 'email', message: 'Formato de email inválido' }
              ]}
            >
              <Input
                prefix={<Mail size={16} className="text-gray-400" />}
                placeholder="seu@email.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Senha"
              rules={[
                { required: true, message: 'Por favor, insira sua senha' },
                { min: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
              ]}
            >
              <Input.Password
                prefix={<Lock size={16} className="text-gray-400" />}
                placeholder="Sua senha"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                {isSignUp ? 'Criar Conta' : 'Entrar'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center">
            <Button
              type="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600"
            >
              {isSignUp
                ? 'Já tem uma conta? Fazer login'
                : 'Não tem conta? Criar agora'
              }
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}