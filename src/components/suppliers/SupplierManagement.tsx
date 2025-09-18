import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Building2, ShoppingCart, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Supplier {
  id: string;
  name: string;
  company_name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  contact_person: string;
  notes: string;
  created_at: string;
}

interface SupplierPurchase {
  id: string;
  supplier_id: string;
  purchase_date: string;
  total_amount: number;
  status: string;
  due_date: string;
  paid_amount: number;
  description: string;
  invoice_number: string;
  supplier: { name: string };
  items?: PurchaseItem[];
}

interface PurchaseItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function SupplierManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<SupplierPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<SupplierPurchase | null>(null);
  
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    company_name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    notes: ''
  });

  const [newPurchase, setNewPurchase] = useState({
    supplier_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    status: 'pending',
    due_date: '',
    paid_amount: 0,
    description: '',
    invoice_number: '',
    items: [{ product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [suppliersData, purchasesData] = await Promise.all([
        supabase
          .from('suppliers')
          .select('*')
          .eq('user_id', user!.id)
          .order('name'),
        supabase
          .from('supplier_purchases')
          .select(`
            *,
            suppliers (name),
            supplier_purchase_items (*)
          `)
          .eq('user_id', user!.id)
          .order('purchase_date', { ascending: false })
      ]);

      setSuppliers(suppliersData.data || []);
      setPurchases(purchasesData.data?.map(p => ({
        ...p,
        supplier: p.suppliers,
        items: p.supplier_purchase_items
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos fornecedores",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSupplier = async () => {
    try {
      if (editingSupplier) {
        await supabase
          .from('suppliers')
          .update(newSupplier)
          .eq('id', editingSupplier.id);
        
        toast({
          title: "Sucesso",
          description: "Fornecedor atualizado com sucesso!",
        });
      } else {
        await supabase
          .from('suppliers')
          .insert([{ ...newSupplier, user_id: user!.id }]);
        
        toast({
          title: "Sucesso",
          description: "Fornecedor cadastrado com sucesso!",
        });
      }

      resetSupplierForm();
      setIsSupplierDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar fornecedor",
        variant: "destructive",
      });
    }
  };

  const handleSavePurchase = async () => {
    try {
      const purchaseData = {
        supplier_id: newPurchase.supplier_id,
        purchase_date: new Date(newPurchase.purchase_date).toISOString(),
        total_amount: newPurchase.total_amount,
        status: newPurchase.status,
        due_date: newPurchase.due_date || null,
        paid_amount: newPurchase.paid_amount,
        description: newPurchase.description,
        invoice_number: newPurchase.invoice_number,
        user_id: user!.id
      };

      let purchaseId;
      
      if (editingPurchase) {
        await supabase
          .from('supplier_purchases')
          .update(purchaseData)
          .eq('id', editingPurchase.id);
        purchaseId = editingPurchase.id;
      } else {
        const { data } = await supabase
          .from('supplier_purchases')
          .insert([purchaseData])
          .select()
          .single();
        purchaseId = data.id;
      }

      // Salvar itens da compra
      if (!editingPurchase) {
        const items = newPurchase.items.map(item => ({
          purchase_id: purchaseId,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        await supabase
          .from('supplier_purchase_items')
          .insert(items);
      }

      toast({
        title: "Sucesso",
        description: editingPurchase ? "Compra atualizada com sucesso!" : "Compra cadastrada com sucesso!",
      });

      resetPurchaseForm();
      setIsPurchaseDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar compra",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await supabase
          .from('suppliers')
          .delete()
          .eq('id', supplierId);
        
        toast({
          title: "Sucesso",
          description: "Fornecedor excluído com sucesso!",
        });
        
        loadData();
      } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir fornecedor",
          variant: "destructive",
        });
      }
    }
  };

  const resetSupplierForm = () => {
    setNewSupplier({
      name: '',
      company_name: '',
      cnpj: '',
      email: '',
      phone: '',
      address: '',
      contact_person: '',
      notes: ''
    });
    setEditingSupplier(null);
  };

  const resetPurchaseForm = () => {
    setNewPurchase({
      supplier_id: '',
      purchase_date: new Date().toISOString().split('T')[0],
      total_amount: 0,
      status: 'pending',
      due_date: '',
      paid_amount: 0,
      description: '',
      invoice_number: '',
      items: [{ product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]
    });
    setEditingPurchase(null);
  };

  const addPurchaseItem = () => {
    setNewPurchase(prev => ({
      ...prev,
      items: [...prev.items, { product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]
    }));
  };

  const updatePurchaseItem = (index: number, field: string, value: any) => {
    setNewPurchase(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      
      if (field === 'quantity' || field === 'unit_price') {
        items[index].total_price = items[index].quantity * items[index].unit_price;
      }
      
      const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);
      
      return { ...prev, items, total_amount };
    });
  };

  const removePurchaseItem = (index: number) => {
    setNewPurchase(prev => {
      const items = prev.items.filter((_, i) => i !== index);
      const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);
      return { ...prev, items, total_amount };
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      paid: { label: 'Pago', variant: 'default' as const },
      partial: { label: 'Parcial', variant: 'outline' as const },
      overdue: { label: 'Vencido', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciamento de Fornecedores</h1>
      </div>

      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Fornecedores Cadastrados</h2>
            <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetSupplierForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                        placeholder="Nome do fornecedor"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_name">Empresa</Label>
                      <Input
                        id="company_name"
                        value={newSupplier.company_name}
                        onChange={(e) => setNewSupplier({...newSupplier, company_name: e.target.value})}
                        placeholder="Nome da empresa"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={newSupplier.cnpj}
                        onChange={(e) => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_person">Pessoa de Contato</Label>
                      <Input
                        id="contact_person"
                        value={newSupplier.contact_person}
                        onChange={(e) => setNewSupplier({...newSupplier, contact_person: e.target.value})}
                        placeholder="Nome do contato"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                      placeholder="Endereço completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={newSupplier.notes}
                      onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                      placeholder="Observações sobre o fornecedor"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsSupplierDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveSupplier}>
                    {editingSupplier ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.company_name || '-'}</TableCell>
                      <TableCell>{supplier.contact_person || '-'}</TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell>{supplier.email || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewSupplier(supplier);
                              setEditingSupplier(supplier);
                              setIsSupplierDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Compras dos Fornecedores</h2>
            <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetPurchaseForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Compra
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPurchase ? 'Editar Compra' : 'Nova Compra'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="supplier">Fornecedor *</Label>
                      <Select 
                        value={newPurchase.supplier_id} 
                        onValueChange={(value) => setNewPurchase({...newPurchase, supplier_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o fornecedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="purchase_date">Data da Compra</Label>
                      <Input
                        id="purchase_date"
                        type="date"
                        value={newPurchase.purchase_date}
                        onChange={(e) => setNewPurchase({...newPurchase, purchase_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="due_date">Data de Vencimento</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={newPurchase.due_date}
                        onChange={(e) => setNewPurchase({...newPurchase, due_date: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={newPurchase.status} 
                        onValueChange={(value: any) => setNewPurchase({...newPurchase, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="partial">Parcial</SelectItem>
                          <SelectItem value="overdue">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="invoice_number">Número da Nota</Label>
                      <Input
                        id="invoice_number"
                        value={newPurchase.invoice_number}
                        onChange={(e) => setNewPurchase({...newPurchase, invoice_number: e.target.value})}
                        placeholder="Número da nota fiscal"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newPurchase.description}
                      onChange={(e) => setNewPurchase({...newPurchase, description: e.target.value})}
                      placeholder="Descrição da compra"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Itens da Compra</Label>
                      <Button type="button" variant="outline" onClick={addPurchaseItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </div>
                    
                    {newPurchase.items.map((item, index) => (
                      <div key={index} className="border p-4 rounded-lg space-y-2">
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-2">
                            <Label>Produto/Mercadoria</Label>
                            <Input
                              value={item.product_name}
                              onChange={(e) => updatePurchaseItem(index, 'product_name', e.target.value)}
                              placeholder="Nome do produto"
                            />
                          </div>
                          <div>
                            <Label>Quantidade</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updatePurchaseItem(index, 'quantity', Number(e.target.value))}
                              min="1"
                            />
                          </div>
                          <div>
                            <Label>Preço Unitário</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updatePurchaseItem(index, 'unit_price', Number(e.target.value))}
                              min="0"
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="flex-1">
                              <Label>Total</Label>
                              <Input
                                type="number"
                                value={item.total_price}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                            {newPurchase.items.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="ml-2"
                                onClick={() => removePurchaseItem(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="total_amount">Valor Total</Label>
                      <Input
                        id="total_amount"
                        type="number"
                        step="0.01"
                        value={newPurchase.total_amount}
                        readOnly
                        className="bg-muted font-bold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paid_amount">Valor Pago</Label>
                      <Input
                        id="paid_amount"
                        type="number"
                        step="0.01"
                        value={newPurchase.paid_amount}
                        onChange={(e) => setNewPurchase({...newPurchase, paid_amount: Number(e.target.value)})}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePurchase}>
                    {editingPurchase ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Nota Fiscal</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.supplier?.name}</TableCell>
                      <TableCell>
                        {format(new Date(purchase.purchase_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{purchase.invoice_number || '-'}</TableCell>
                      <TableCell>R$ {purchase.total_amount.toFixed(2)}</TableCell>
                      <TableCell>R$ {purchase.paid_amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      <TableCell>
                        {purchase.due_date ? format(new Date(purchase.due_date), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewPurchase({
                                supplier_id: purchase.supplier_id,
                                purchase_date: purchase.purchase_date.split('T')[0],
                                total_amount: purchase.total_amount,
                                status: purchase.status,
                                due_date: purchase.due_date?.split('T')[0] || '',
                                paid_amount: purchase.paid_amount,
                                description: purchase.description || '',
                                invoice_number: purchase.invoice_number || '',
                                items: purchase.items || []
                              });
                              setEditingPurchase(purchase);
                              setIsPurchaseDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
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
}