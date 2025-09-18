import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole, Permission } from '@/contexts/RoleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallback
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, loading: roleLoading } = useRole();

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle>Acesso Restrito</CardTitle>
          <CardDescription>
            Você precisa estar logado para acessar esta área.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Permissão Negada</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta funcionalidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Entre em contato com o administrador do sistema para solicitar acesso.
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};