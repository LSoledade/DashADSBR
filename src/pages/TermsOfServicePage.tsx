import React from 'react'
import { Typography, Card, Space, Divider } from 'antd'
import { FileText, TrendingUp } from 'lucide-react'

const { Title, Paragraph, Text } = Typography

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Space direction="vertical" size="middle">
            <TrendingUp className="text-blue-600 mx-auto" size={48} />
            <Title level={1} className="!mb-0 text-gray-800">
              Termos de Serviço
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
                <FileText className="text-blue-600" size={24} />
                Termos de Serviço
              </Title>
              <Text className="text-gray-500">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </Text>
            </div>

            <Divider />

            <div>
              <Title level={3}>1. Aceitação dos Termos</Title>
              <Paragraph>
                Ao acessar e usar o Dash Ads BR, você concorda em cumprir e estar vinculado a estes 
                Termos de Serviço. Se você não concordar com qualquer parte destes termos, não deve 
                usar nosso serviço.
              </Paragraph>
            </div>

            <div>
              <Title level={3}>2. Descrição do Serviço</Title>
              <Paragraph>
                O Dash Ads BR é um dashboard web que permite visualizar e analisar métricas de 
                performance de suas campanhas publicitárias do Meta (Facebook e Instagram) de forma 
                simplificada e em português brasileiro.
              </Paragraph>
            </div>

            <div>
              <Title level={3}>3. Requisitos de Elegibilidade</Title>
              <Paragraph>
                Para usar nosso serviço, você deve:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Ter pelo menos 18 anos de idade</Text></li>
                <li><Text>• Possuir uma conta válida no Meta Business</Text></li>
                <li><Text>• Ter acesso a pelo menos uma conta de anúncios do Meta</Text></li>
                <li><Text>• Fornecer informações precisas e completas durante o registro</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>4. Conta do Usuário</Title>
              <Paragraph>
                Você é responsável por:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Manter a confidencialidade de suas credenciais de login</Text></li>
                <li><Text>• Todas as atividades que ocorrem em sua conta</Text></li>
                <li><Text>• Notificar-nos imediatamente sobre qualquer uso não autorizado</Text></li>
                <li><Text>• Manter suas informações de conta atualizadas</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>5. Uso Aceitável</Title>
              <Paragraph>
                Você concorda em NÃO:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Usar o serviço para qualquer finalidade ilegal ou não autorizada</Text></li>
                <li><Text>• Tentar acessar contas ou dados de outros usuários</Text></li>
                <li><Text>• Interferir ou interromper o funcionamento do serviço</Text></li>
                <li><Text>• Usar o serviço para spam ou atividades maliciosas</Text></li>
                <li><Text>• Violar os termos de uso do Meta ou suas políticas</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>6. Integração com o Meta</Title>
              <Paragraph>
                Nosso serviço integra-se com a API do Meta para acessar suas métricas de anúncios. 
                Você entende e concorda que:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Deve autorizar o acesso às suas contas de anúncio do Meta</Text></li>
                <li><Text>• Está sujeito aos termos e políticas do Meta</Text></li>
                <li><Text>• Podemos ser afetados por mudanças na API ou políticas do Meta</Text></li>
                <li><Text>• Você pode revogar o acesso a qualquer momento</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>7. Disponibilidade do Serviço</Title>
              <Paragraph>
                Embora nos esforcemos para manter o serviço disponível 24/7, não garantimos que:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• O serviço será ininterrupto ou livre de erros</Text></li>
                <li><Text>• Todas as funcionalidades estarão sempre disponíveis</Text></li>
                <li><Text>• Os dados do Meta estarão sempre atualizados</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>8. Propriedade Intelectual</Title>
              <Paragraph>
                O Dash Ads BR e todo seu conteúdo, incluindo mas não limitado a texto, gráficos, 
                logos, ícones, imagens e software, são propriedade nossa ou de nossos licenciadores 
                e estão protegidos por leis de direitos autorais e outras leis de propriedade intelectual.
              </Paragraph>
            </div>

            <div>
              <Title level={3}>9. Limitação de Responsabilidade</Title>
              <Paragraph>
                Em nenhuma circunstância seremos responsáveis por:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Danos indiretos, incidentais, especiais ou consequenciais</Text></li>
                <li><Text>• Perda de lucros, receitas ou dados</Text></li>
                <li><Text>• Interrupções de negócios</Text></li>
                <li><Text>• Decisões tomadas com base nos dados fornecidos</Text></li>
              </ul>
            </div>

            <div>
              <Title level={3}>10. Isenção de Garantias</Title>
              <Paragraph>
                O serviço é fornecido "como está" e "conforme disponível", sem garantias de qualquer tipo, 
                expressas ou implícitas, incluindo mas não se limitando a garantias de comercialização, 
                adequação a um propósito específico ou não violação.
              </Paragraph>
            </div>

            <div>
              <Title level={3}>11. Rescisão</Title>
              <Paragraph>
                Podemos suspender ou encerrar sua conta e acesso ao serviço a qualquer momento, 
                por qualquer motivo, incluindo violação destes termos. Você também pode encerrar 
                sua conta a qualquer momento.
              </Paragraph>
            </div>

            <div>
              <Title level={3}>12. Modificações dos Termos</Title>
              <Paragraph>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos 
                sobre mudanças significativas por email ou através de um aviso em nossa aplicação. 
                O uso continuado do serviço após as modificações constitui aceitação dos novos termos.
              </Paragraph>
            </div>

            <div>
              <Title level={3}>13. Lei Aplicável</Title>
              <Paragraph>
                Estes termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos 
                tribunais competentes do Brasil.
              </Paragraph>
            </div>

            <div>
              <Title level={3}>14. Contato</Title>
              <Paragraph>
                Para questões sobre estes Termos de Serviço, entre em contato conosco:
              </Paragraph>
              <ul className="ml-4 space-y-2">
                <li><Text>• Email: suporte@dashads.com.br</Text></li>
                <li><Text>• Endereço: [Seu endereço comercial]</Text></li>
              </ul>
            </div>

            <Divider />
            
            <div className="text-center">
              <Text className="text-gray-500">
                Ao usar o Dash Ads BR, você concorda com estes Termos de Serviço e nossa Política de Privacidade.
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  )
}