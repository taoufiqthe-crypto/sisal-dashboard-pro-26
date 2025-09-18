import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PlusCircle, Package, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// IMPORTAÇÃO CORRIGIDA: Usa "../" para voltar uma pasta
import { NewProductForm } from "../products/NewProductForm";
import { BackupRestore } from "../backup/BackupRestore";

interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

interface SettingsProps {
  onProductAdded: (newProduct: Omit<Product, 'id'>) => void;
  onClearAllData?: () => void;
}

export function Settings({ onProductAdded, onClearAllData }: SettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProductAdded = (newProduct: Omit<Product, 'id'>) => {
    onProductAdded(newProduct);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">Ajuste as configurações do sistema.</p>
        </div>
        
        {/* Adicionado o botão de Novo Produto aqui também, caso o usuário queira adicionar um produto a partir da tela de configurações */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4" />
              <span>Novo Produto</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
            </DialogHeader>
            <NewProductForm onProductAdded={handleProductAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restauração</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Dados do Sistema</span>
            </h3>
            <p className="text-muted-foreground">
              Gerenciar dados do sistema e configurações gerais.
            </p>
            <div className="mt-4 flex space-x-2">
              {onClearAllData && (
                <Button 
                  variant="destructive" 
                  onClick={onClearAllData}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar Todos os Dados</span>
                </Button>
              )}
            </div>
          </Card>

          {/* Aviso sobre limpeza de dados */}
          {onClearAllData && (
            <Card className="p-6 bg-destructive/5 border-destructive/20">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-semibold text-destructive">Área Perigosa</h4>
                  <p className="text-sm text-muted-foreground">
                    O botão "Limpar Todos os Dados" irá apagar permanentemente todas as informações do sistema incluindo produtos, vendas, clientes, estoque e produção. Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="backup">
          <BackupRestore />
        </TabsContent>
      </Tabs>

    </div>
  );
}