import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Operator {
  id: string;
  name: string;
  code: string;
  role: 'admin' | 'operator' | 'cashier';
  permissions: string[];
  isActive: boolean;
}

const defaultOperators: Operator[] = [
  {
    id: '1',
    name: 'Administrador',
    code: '0000',
    role: 'admin',
    permissions: ['all'],
    isActive: true
  },
  {
    id: '2',
    name: 'Operador 1',
    code: '1001',
    role: 'operator',
    permissions: ['sales', 'customers', 'products'],
    isActive: true
  },
  {
    id: '3',
    name: 'Caixa',
    code: '2001',
    role: 'cashier',
    permissions: ['sales'],
    isActive: true
  }
];

interface OperatorLoginProps {
  onOperatorLogin: (operator: Operator) => void;
  currentOperator?: Operator | null;
}

export function OperatorLogin({ onOperatorLogin, currentOperator }: OperatorLoginProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!code.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Digite o código do operador",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const operator = defaultOperators.find(op => op.code === code && op.isActive);
    
    if (operator) {
      onOperatorLogin(operator);
      toast({
        title: "Login realizado",
        description: `Bem-vindo(a), ${operator.name}!`
      });
      setCode('');
    } else {
      toast({
        title: "Código inválido",
        description: "Operador não encontrado ou inativo",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    onOperatorLogin(null as any);
    toast({
      title: "Logout realizado",
      description: "Sessão encerrada com sucesso"
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'operator': return 'secondary';
      case 'cashier': return 'outline';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'operator': return 'Operador';
      case 'cashier': return 'Caixa';
      default: return role;
    }
  };

  if (currentOperator) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5" />
            Operador Logado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="font-medium text-lg">{currentOperator.name}</p>
            <Badge variant={getRoleBadgeVariant(currentOperator.role)}>
              {getRoleLabel(currentOperator.role)}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Permissões:</Label>
            <div className="flex flex-wrap gap-1">
              {currentOperator.permissions.includes('all') ? (
                <Badge variant="default">Todas as permissões</Badge>
              ) : (
                currentOperator.permissions.map(permission => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))
              )}
            </div>
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full"
          >
            Trocar Operador
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Users className="w-5 h-5" />
          Login do Operador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="operator-code">Código do Operador</Label>
          <div className="relative">
            <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="operator-code"
              type="password"
              placeholder="Digite seu código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="pl-10"
              maxLength={6}
            />
          </div>
        </div>

        <Button 
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Verificando...' : 'Entrar'}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Códigos de teste:</strong></p>
          <p>• 0000 - Administrador</p>
          <p>• 1001 - Operador</p>
          <p>• 2001 - Caixa</p>
        </div>
      </CardContent>
    </Card>
  );
}