import React from 'react'
import { Typography, Card, Space, Divider } from 'antd'
import { Shield, TrendingUp } from 'lucide-react'

const { Title, Paragraph, Text } = Typography

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Space direction="vertical" size="middle">
            <TrendingUp className="text-blue-600 mx-auto" size={48} />
            <Title level={1} className="!mb-0 text-gray-800">
              Política de Privacidade
            </Title>
            <Text className="text-gray-600">
              Dash Ads BR - Dashboard para Meta Ads
            </Text>
          </Space>
        </div>

        <Card className="shadow-lg">
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <Title level={2} className="flex items-center gap-2">
                <Shield className="text-blue-600" size={24} />
                Política de Privacidade
              </Title>
              <Text className="text-gray-500">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </Text>
            </div>

            <Divider />

            <div>
              <Title level={3}>1. Informações que Coletamos</Title>
              <Paragraph>
                O Dash Ads BR coleta e processa as seguintes informações:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• <strong>Informações de Conta:</strong> Email e nome fornecidos durante o cadastro</Text></li>
                <li><Text>• <strong>Dados do Meta:</strong> Métricas de performance de suas campanhas publicitárias (gastos, impressões, cliques, conversões)</Text></li>
                <li><Text>• <strong>Tokens de Acesso:</strong> Tokens OAuth do Meta para acessar suas contas de anúncio (armazenados de forma criptografada)</Text></li>
                <li><Text>• <strong>Dados de Uso:</strong> Informações sobre como você usa nossa aplicação</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>2. Como Usamos suas Informações</Title>
              <Paragraph>
                Utilizamos suas informações para:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Fornecer análises e relatórios de performance de suas campanhas</Text></li>
                <li><Text>• Manter sua conta segura e autenticada</Text></li>
                <li><Text>• Melhorar nossos serviços e funcionalidades</Text></li>
                <li><Text>• Comunicar atualizações importantes sobre o serviço</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>3. Compartilhamento de Informações</Title>
              <Paragraph>
                <strong>Não vendemos, alugamos ou compartilhamos suas informações pessoais</strong> com terceiros, exceto:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Com o Meta (Facebook), apenas para acessar suas métricas de anúncios através da API oficial</Text></li>
                <li><Text>• Quando exigido por lei ou para proteger nossos direitos legais</Text></li>
                <li><Text>• Com provedores de serviços que nos ajudam a operar a plataforma (Supabase), sob acordos de confidencialidade</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>4. Segurança dos Dados</Title>
              <Paragraph>
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Criptografia de dados em trânsito e em repouso</Text></li>
                <li><Text>• Tokens de acesso armazenados de forma segura no banco de dados</Text></li>
                <li><Text>• Acesso restrito a dados pessoais apenas por pessoal autorizado</Text></li>
                <li><Text>• Monitoramento contínuo de segurança</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>5. Seus Direitos</Title>
              <Paragraph>
                Você tem o direito de:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Acessar suas informações pessoais</Text></li>
                <li><Text>• Corrigir informações incorretas</Text></li>
                <li><Text>• Excluir sua conta e todos os dados associados</Text></li>
                <li><Text>• Revogar permissões de acesso ao Meta a qualquer momento</Text></li>
                <li><Text>• Portabilidade dos seus dados</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>6. Retenção de Dados</Title>
              <Paragraph>
                Mantemos suas informações enquanto sua conta estiver ativa. Após a exclusão da conta, 
                todos os dados pessoais são removidos de nossos sistemas em até 30 dias, exceto quando 
                a retenção for exigida por lei.
              </Paragraph>
            </div>

            <div>
              <Title level={3}>7. Cookies e Tecnologias Similares</Title>
              <Paragraph>
                Utilizamos cookies e tecnologias similares para:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Manter você logado na aplicação</Text></li>
                <li><Text>• Lembrar suas preferências</Text></li>
                <li><Text>• Analisar o uso da aplicação para melhorias</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>8. Alterações nesta Política</Title>
              <Paragraph>
                Podemos atualizar esta Política de Privacidade ocasionalmente. Notificaremos sobre 
                mudanças significativas por email ou através de um aviso em nossa aplicação.
              </Paragraph>
            </div>

            <div>
              <Title level={3}>9. Contato</Title>
              <Paragraph>
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, 
                entre em contato conosco:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Email: privacidade@dashads.com.br</Text></li>
                <li><Text>• Endereço: [Seu endereço comercial]</Text></li>
              </ul>
            </div>

            <Divider />
            
            <div className="text-center">
              <Text className="text-gray-500">
                Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD) do Brasil.
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  )
}