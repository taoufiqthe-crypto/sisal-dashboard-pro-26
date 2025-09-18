import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Customer } from "@/components/sales";

interface CustomerManagementProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

export function CustomerManagement({ customers, setCustomers }: CustomerManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // campos do form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [complement, setComplement] = useState("");

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setDocument("");
    setAddress("");
    setCity("");
    setState("");
    setZipCode("");
    setNeighborhood("");
    setComplement("");
    setEditingCustomer(null);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingCustomer) {
      // atualização
      const updated = customers.map((c) =>
        c.id === editingCustomer.id ? { 
          ...editingCustomer, 
          name, 
          phone, 
          email,
          document,
          address,
          city,
          state,
          zipCode,
          neighborhood,
          complement
        } : c
      );
      setCustomers(updated);
    } else {
      // novo cadastro
      const newCustomer: Customer = {
        id: Date.now(),
        name,
        phone,
        email,
        document,
        address,
        city,
        state,
        zipCode,
        neighborhood,
        complement
      };
      setCustomers([...customers, newCustomer]);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setPhone(customer.phone || "");
    setEmail(customer.email || "");
    setDocument(customer.document || "");
    setAddress(customer.address || "");
    setCity(customer.city || "");
    setState(customer.state || "");
    setZipCode(customer.zipCode || "");
    setNeighborhood(customer.neighborhood || "");
    setComplement(customer.complement || "");
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este cliente?")) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome *</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label>CPF/CNPJ</Label>
                <Input 
                  value={document} 
                  onChange={(e) => setDocument(e.target.value)} 
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="col-span-2">
                <Label>CEP</Label>
                <Input 
                  value={zipCode} 
                  onChange={(e) => setZipCode(e.target.value)} 
                  placeholder="00000-000"
                />
              </div>
              <div className="col-span-2">
                <Label>Endereço</Label>
                <Input 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input 
                  value={neighborhood} 
                  onChange={(e) => setNeighborhood(e.target.value)} 
                  placeholder="Nome do bairro"
                />
              </div>
              <div>
                <Label>Complemento</Label>
                <Input 
                  value={complement} 
                  onChange={(e) => setComplement(e.target.value)} 
                  placeholder="Apt, Bloco, etc."
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="Nome da cidade"
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Input 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingCustomer ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de clientes */}
      <Card className="p-4 space-y-3">
        {customers.length === 0 ? (
          <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border-b pb-2 last:border-none last:pb-0"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                {c.document && <p className="text-sm text-muted-foreground">📄 {c.document}</p>}
                {c.phone && <p className="text-sm text-muted-foreground">📞 {c.phone}</p>}
                {c.email && <p className="text-sm text-muted-foreground">✉️ {c.email}</p>}
                {c.address && (
                  <p className="text-sm text-muted-foreground">
                    📍 {c.address}
                    {c.neighborhood && `, ${c.neighborhood}`}
                    {c.city && `, ${c.city}`}
                    {c.state && `/${c.state}`}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                  Remover
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
