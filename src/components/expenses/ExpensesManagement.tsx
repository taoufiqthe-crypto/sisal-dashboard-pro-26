import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  CreditCard, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Receipt,
  Edit,
  Trash2,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

interface Expense {
  id: number;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: "dinheiro" | "pix" | "credito" | "debito" | "boleto";
  supplier?: string;
  dueDate?: string;
  status: "pago" | "pendente" | "vencido";
  receipt?: string;
  notes?: string;
}

type ExpenseCategory = 
  | "aluguel"
  | "agua"
  | "luz"
  | "internet"
  | "telefone"
  | "funcionarios"
  | "material"
  | "combustivel"
  | "manutencao"
  | "marketing"
  | "contabilidade"
  | "impostos"
  | "outros";

const expenseCategories: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "aluguel", label: "Aluguel", icon: "🏠" },
  { value: "agua", label: "Água", icon: "💧" },
  { value: "luz", label: "Energia Elétrica", icon: "⚡" },
  { value: "internet", label: "Internet", icon: "🌐" },
  { value: "telefone", label: "Telefone", icon: "📞" },
  { value: "funcionarios", label: "Funcionários", icon: "👥" },
  { value: "material", label: "Material", icon: "📦" },
  { value: "combustivel", label: "Combustível", icon: "⛽" },
  { value: "manutencao", label: "Manutenção", icon: "🔧" },
  { value: "marketing", label: "Marketing", icon: "📢" },
  { value: "contabilidade", label: "Contabilidade", icon: "📊" },
  { value: "impostos", label: "Impostos", icon: "💰" },
  { value: "outros", label: "Outros", icon: "📝" },
];

const paymentMethods = [
  { value: "dinheiro", label: "Dinheiro", icon: "💰" },
  { value: "pix", label: "PIX", icon: "📱" },
  { value: "credito", label: "Cartão de Crédito", icon: "💳" },
  { value: "debito", label: "Cartão de Débito", icon: "💳" },
  { value: "boleto", label: "Boleto", icon: "📋" },
];

export function ExpensesManagement() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "" as ExpenseCategory,
    description: "",
    amount: "",
    paymentMethod: "dinheiro" as Expense["paymentMethod"],
    supplier: "",
    dueDate: "",
    status: "pago" as Expense["status"],
    notes: "",
  });

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user!.id)
        .order('expense_date', { ascending: false });

      if (error) throw error;

      const transformedExpenses: Expense[] = (data || []).map(expense => ({
        id: parseInt(expense.id),
        date: expense.expense_date,
        category: expense.category as ExpenseCategory,
        description: expense.description,
        amount: parseFloat(expense.amount.toString()),
        paymentMethod: expense.payment_method as Expense["paymentMethod"],
        supplier: expense.supplier_id || undefined,
        status: expense.status as Expense["status"],
        notes: expense.notes || undefined,
      }));

      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      toast.error('Erro ao carregar despesas');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      category: "" as ExpenseCategory,
      description: "",
      amount: "",
      paymentMethod: "dinheiro",
      supplier: "",
      dueDate: "",
      status: "pago",
      notes: "",
    });
    setEditingExpense(null);
  };

  const handleSave = async () => {
    if (!formData.category || !formData.description || !formData.amount) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const expenseData = {
        user_id: user!.id,
        expense_date: formData.date,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        payment_method: formData.paymentMethod,
        supplier_id: formData.supplier || null,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id.toString());

        if (error) throw error;
        toast.success("Despesa atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);

        if (error) throw error;
        toast.success("Despesa cadastrada com sucesso!");
      }

      resetForm();
      setIsDialogOpen(false);
      await loadExpenses();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast.error('Erro ao salvar despesa');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      paymentMethod: expense.paymentMethod,
      supplier: expense.supplier || "",
      dueDate: expense.dueDate || "",
      status: expense.status,
      notes: expense.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id.toString());

        if (error) throw error;
        
        toast.success("Despesa excluída com sucesso!");
        await loadExpenses();
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
        toast.error('Erro ao excluir despesa');
      }
    }
  };

  const exportToExcel = () => {
    const data = expenses.map(expense => ({
      Data: format(new Date(expense.date), "dd/MM/yyyy"),
      Categoria: expenseCategories.find(cat => cat.value === expense.category)?.label || expense.category,
      Descrição: expense.description,
      Valor: `R$ ${expense.amount.toFixed(2)}`,
      "Forma de Pagamento": paymentMethods.find(pm => pm.value === expense.paymentMethod)?.label || expense.paymentMethod,
      Fornecedor: expense.supplier || "N/A",
      "Data Vencimento": expense.dueDate ? format(new Date(expense.dueDate), "dd/MM/yyyy") : "N/A",
      Status: expense.status,
      Observações: expense.notes || "N/A",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Despesas");
    
    const today = format(new Date(), "dd-MM-yyyy");
    XLSX.writeFile(wb, `Despesas_${today}.xlsx`);
    toast.success("Relatório exportado com sucesso!");
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStatusBadge = (status: Expense["status"]) => {
    const variants = {
      pago: { label: "Pago", variant: "default" as const },
      pendente: { label: "Pendente", variant: "secondary" as const },
      vencido: { label: "Vencido", variant: "destructive" as const },
    };
    
    const statusInfo = variants[status];
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    return expenseCategories.find(cat => cat.value === category)?.icon || "📝";
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses.filter(exp => exp.status === "pendente").length;
  const overdueExpenses = expenses.filter(exp => exp.status === "vencido").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Despesas</h2>
          <p className="text-muted-foreground">Controle suas despesas operacionais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? "Editar Despesa" : "Nova Despesa"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: ExpenseCategory) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Descrição *</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrição da despesa"
                  />
                </div>
                <div>
                  <Label>Valor *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value: Expense["paymentMethod"]) => setFormData({...formData, paymentMethod: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <span>{method.icon}</span>
                            {method.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fornecedor</Label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    placeholder="Nome do fornecedor"
                  />
                </div>
                <div>
                  <Label>Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: Expense["status"]) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Observações adicionais"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingExpense ? "Salvar Alterações" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold">Total de Despesas</h3>
          </div>
          <p className="text-2xl font-bold text-red-500 mt-2">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-sm text-muted-foreground">este mês</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Total de Despesas</h3>
          </div>
          <p className="text-2xl font-bold text-blue-500 mt-2">
            {expenses.length}
          </p>
          <p className="text-sm text-muted-foreground">cadastradas</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Pendentes</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-500 mt-2">
            {pendingExpenses}
          </p>
          <p className="text-sm text-muted-foreground">para pagar</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold">Vencidas</h3>
          </div>
          <p className="text-2xl font-bold text-red-500 mt-2">
            {overdueExpenses}
          </p>
          <p className="text-sm text-muted-foreground">em atraso</p>
        </Card>
      </div>

      {/* Tabela de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhuma despesa cadastrada
              </h3>
              <p className="text-sm text-muted-foreground">
                Cadastre sua primeira despesa para começar o controle financeiro
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {format(new Date(expense.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(expense.category)}</span>
                          {expenseCategories.find(cat => cat.value === expense.category)?.label}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {expense.description}
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        {paymentMethods.find(pm => pm.value === expense.paymentMethod)?.label}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(expense.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}