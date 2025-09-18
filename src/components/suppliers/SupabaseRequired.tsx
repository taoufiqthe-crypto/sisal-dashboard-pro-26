import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, ExternalLink, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SupabaseRequiredProps {
  feature: string;
  description: string;
}

export const SupabaseRequired = ({ feature, description }: SupabaseRequiredProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{feature}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary">
          <Database className="w-4 h-4 mr-2" />
          Requer Backend
        </Badge>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Zap className="w-5 h-5" />
            Funcionalidade Premium - Supabase Necessário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Para utilizar o {feature.toLowerCase()}, você precisa conectar seu projeto ao Supabase. 
            Esta integração nativa do Lovable permite:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">🗄️ Banco de Dados</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Armazenamento persistente</li>
                <li>• Sincronização em tempo real</li>
                <li>• Backup automático</li>
                <li>• Relacionamentos complexos</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">🔐 Autenticação</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Login seguro</li>
                <li>• Controle de acesso</li>
                <li>• Múltiplos usuários</li>
                <li>• Logs de auditoria</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">📊 Relatórios Avançados</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Análises complexas</li>
                <li>• Histórico completo</li>
                <li>• Exportação de dados</li>
                <li>• Dashboard executivo</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">🔄 APIs e Integrações</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Envio de emails</li>
                <li>• Integração com pagamentos</li>
                <li>• Webhooks</li>
                <li>• Conectores externos</li>
              </ul>
            </div>
          </div>

          <div className="bg-background border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Como ativar o Supabase?
            </h4>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li>1. Clique no botão verde <strong>Supabase</strong> no canto superior direito</li>
              <li>2. Siga as instruções para conectar ou criar um projeto Supabase</li>
              <li>3. Aguarde a configuração automática das tabelas e políticas</li>
              <li>4. Volte aqui e aproveite todas as funcionalidades!</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button className="pdv-btn-primary" asChild>
              <a href="https://docs.lovable.dev/integrations/supabase/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Documentação
              </a>
            </Button>
            <Button variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Ativar Supabase Agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};