import React from 'react';
import { Card } from '@/components/ui/card';

const BudgetModel: React.FC = () => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Modelo de Orçamento</h2>
      <p className="text-muted-foreground">
        Este componente está sendo migrado para usar os componentes UI atuais do projeto.
        Material-UI foi removido em favor da biblioteca UI atual.
      </p>
    </Card>
  );
};

export default BudgetModel;