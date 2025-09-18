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
  title: string;
  description: string;
  type: 'receivable' | 'payable';
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  category: string;
  customer_id?: string;
  supplier_id?: string;
}

interface CashFlow {
  id: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
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
    title: '',
    description: '',
    type: 'receivable' as 'receivable' | 'payable',
    amount: '',
    due_date: '',
    category: '',
    customer_id: '',
    supplier_id: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [accountsData, cashFlowData, customersData, suppliersData] = await Promise.all([
        supabase.from('accounts').select(`
          *,
          customers (name),
          suppliers (name)
        `).eq('user_id', user!.id),
        supabase.from('cash_flow').select('*').eq('user_id', user!.id),
        supabase.from('customers').select('id, name').eq('user_id', user!.id),
        supabase.from('suppliers').select('id, name').eq('user_id', user!.id)
      ]);

      setAccounts((accountsData.data || []) as Account[]);
      setCashFlow((cashFlowData.data || []) as CashFlow[]);
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
    if (!user || !newAccount.title || !newAccount.amount || !newAccount.due_date) {
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
        title: newAccount.title,
        description: newAccount.description,
        type: newAccount.type,
        amount: parseFloat(newAccount.amount),
        due_date: newAccount.due_date,
        category: newAccount.category,
        customer_id: newAccount.customer_id || null,
        supplier_id: newAccount.supplier_id || null,
        user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso!",
      });

      setNewAccount({
        title: '',
        description: '',
        type: 'receivable',
        amount: '',
        due_date: '',
        category: '',
        customer_id: '',
        supplier_id: ''
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

  const markAsPaid = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ 
          status: 'paid', 
          paid_date: new Date().toISOString().split('T')[0] 
        })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta marcada como paga!",
      });
      loadData();
    } catch (error) {
      console.error('Erro ao marcar como paga:', error);
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

  const totalReceivable = accounts
    .filter(acc => acc.type === 'receivable' && acc.status === 'pending')
    .reduce((sum, acc) => sum + acc.amount, 0);

  const totalPayable = accounts
    .filter(acc => acc.type === 'payable' && acc.status === 'pending')
    .reduce((sum, acc) => sum + acc.amount, 0);

  const monthlyIncome = cashFlow
    .filter(cf => cf.type === 'income' && cf.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, cf) => sum + cf.amount, 0);

  const monthlyExpense = cashFlow
    .filter(cf => cf.type === 'expense' && cf.date.startsWith(new Date().toISOString().slice(0, 7)))
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
                <Label>Título *</Label>
                <Input
                  value={newAccount.title}
                  onChange={(e) => setNewAccount({ ...newAccount, title: e.target.value })}
                  placeholder="Título da conta"
                />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select value={newAccount.type} onValueChange={(value: 'receivable' | 'payable') => setNewAccount({ ...newAccount, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receivable">A Receber</SelectItem>
                    <SelectItem value="payable">A Pagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newAccount.amount}
                  onChange={(e) => setNewAccount({ ...newAccount, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Data de Vencimento *</Label>
                <Input
                  type="date"
                  value={newAccount.due_date}
                  onChange={(e) => setNewAccount({ ...newAccount, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Input
                  value={newAccount.category}
                  onChange={(e) => setNewAccount({ ...newAccount, category: e.target.value })}
                  placeholder="Categoria"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                  placeholder="Descrição da conta"
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
              <TrendingUp className="h-4 w-4 text-green-500" />
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceivable.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              A Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalPayable.toFixed(2)}
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
              <CardTitle>Contas</CardTitle>
              <CardDescription>Gerencie suas contas a pagar e receber</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{account.title}</div>
                          {account.description && (
                            <div className="text-sm text-muted-foreground">{account.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.type === 'receivable' ? 'default' : 'secondary'}>
                          {account.type === 'receivable' ? 'A Receber' : 'A Pagar'}
                        </Badge>
                      </TableCell>
                      <TableCell className={account.type === 'receivable' ? 'text-green-600' : 'text-red-600'}>
                        R$ {account.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(account.due_date), 'dd/MM/yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell>
                        {account.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaid(account.id)}
                          >
                            Marcar como Pago
                          </Button>
                        )}
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
                      <TableCell>{format(new Date(flow.date), 'dd/MM/yyyy')}</TableCell>
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