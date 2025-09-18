import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Calendar, DollarSign, PlusCircle, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface CashFlow {
  id: string;
  description: string;
  type: string;
  amount: number;
  category: string;
  created_at: string;
  account_id?: string;
  user_id: string;
}

export const FinancialManagement = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    balance: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [accountsData, cashFlowData, customersData, suppliersData] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user!.id),
        supabase.from('cash_flow').select('*').eq('user_id', user!.id),
        supabase.from('customers').select('id, name').eq('user_id', user!.id),
        supabase.from('suppliers').select('id, name').eq('user_id', user!.id)
      ]);

      setAccounts(accountsData.data || []);
      setCashFlow(cashFlowData.data || []);
      setCustomers(customersData.data || []);
      setSuppliers(suppliersData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros.",
        variant: "destructive",
      });
    }
  };

  const createAccount = async () => {
    if (!user || !newAccount.name || !newAccount.balance) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('accounts').insert({
        name: newAccount.name,
        type: newAccount.type,
        balance: parseFloat(newAccount.balance),
        user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso!",
      });

      setNewAccount({
        name: '',
        type: 'checking',
        balance: '',
      });
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalance = async (accountId: string, newBalance: number) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ 
          balance: newBalance
        })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Saldo atualizado com sucesso!",
      });
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conta.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      paid: { label: 'Pago', variant: 'default' as const },
      overdue: { label: 'Vencido', variant: 'destructive' as const },
      cancelled: { label: 'Cancelado', variant: 'outline' as const }
    };
    
    const statusInfo = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const checkingAccounts = accounts.filter(acc => acc.type === 'checking');
  const savingsAccounts = accounts.filter(acc => acc.type === 'savings');

  const monthlyIncome = cashFlow
    .filter(cf => cf.type === 'income' && cf.created_at.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, cf) => sum + cf.amount, 0);

  const monthlyExpense = cashFlow
    .filter(cf => cf.type === 'expense' && cf.created_at.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, cf) => sum + cf.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão Financeira</h2>
          <p className="text-muted-foreground">Controle completo das suas finanças</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Conta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="Nome da conta"
                />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select value={newAccount.type} onValueChange={(value) => setNewAccount({ ...newAccount, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Saldo Inicial *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <Button onClick={createAccount} disabled={isLoading} className="w-full">
                {isLoading ? 'Criando...' : 'Criar Conta'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Saldo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {totalBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-green-500" />
              Contas Correntes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {checkingAccounts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {monthlyIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-orange-500" />
              Despesa Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              R$ {monthlyExpense.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">Contas a Pagar/Receber</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Contas Bancárias</CardTitle>
              <CardDescription>Gerencie suas contas bancárias</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="font-medium">{account.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {account.type === 'checking' ? 'Conta Corrente' : 
                           account.type === 'savings' ? 'Poupança' : 'Investimento'}
                        </Badge>
                      </TableCell>
                      <TableCell className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        R$ {account.balance.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(account.created_at), 'dd/MM/yyyy')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
              <CardDescription>Histórico de entradas e saídas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlow.map((flow) => (
                    <TableRow key={flow.id}>
                      <TableCell>{format(new Date(flow.created_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{flow.description}</TableCell>
                      <TableCell>{flow.category}</TableCell>
                      <TableCell>
                        <Badge variant={flow.type === 'income' ? 'default' : 'secondary'}>
                          {flow.type === 'income' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </TableCell>
                      <TableCell className={flow.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {flow.type === 'income' ? '+' : '-'} R$ {flow.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};