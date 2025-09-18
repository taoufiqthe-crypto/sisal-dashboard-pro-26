// src/components/Manufacturing/Manufacturing.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, Cog, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ManufacturingProps {
  onTabChange: (tab: string) => void;
  onProductionToStock?: (production: any) => void;
  productions?: any[];
  setProductions?: React.Dispatch<React.SetStateAction<any[]>>;
}

const loadProductionsFromLocalStorage = () => {
  try {
    const storedProductions = localStorage.getItem("productions");
    return storedProductions ? JSON.parse(storedProductions) : [];
  } catch (error) {
    console.error("Failed to load productions from localStorage", error);
    return [];
  }
};

const getPieceTotals = (productions: any[]) => {
  return productions.reduce<Record<string, number>>((acc, production) => {
    const pieceName = (production.pieceName || "").toLowerCase();
    const qty = Number(production.quantity) || 0;
    if (!pieceName) return acc;
    acc[pieceName] = (acc[pieceName] || 0) + qty;
    return acc;
  }, {});
};

export function Manufacturing({ 
  onTabChange, 
  onProductionToStock,
  productions: externalProductions,
  setProductions: setExternalProductions
}: ManufacturingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Usar productions externas se fornecidas, senão usar localStorage
  const [productions, setProductions] = useState<any[]>(
    externalProductions || loadProductionsFromLocalStorage()
  );
  const [productionData, setProductionData] = useState({
    date: "",
    pieceName: "",
    quantity: "",
    gessoSacos: "",
    colaborador: "",
  });

  const [selectedColaborador, setSelectedColaborador] = useState<string>("Todos");

  useEffect(() => {
    try {
      localStorage.setItem("productions", JSON.stringify(productions));
      // Atualizar productions externas se setProductions estiver disponível
      if (setExternalProductions) {
        setExternalProductions(productions);
      }
    } catch (error) {
      console.error("Failed to save productions to localStorage", error);
    }
  }, [productions, setExternalProductions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProductionData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSaveProduction = () => {
    const newId =
      productions.length > 0
        ? Math.max(...productions.map((p) => p.id || 0)) + 1
        : 1;

    const newProduction = {
      ...productionData,
      id: newId,
      quantity: Number(productionData.quantity) || 0,
      gessoSacos: Number(productionData.gessoSacos) || 0,
    };

    setProductions((prev) => [...prev, newProduction]);

    setProductionData({
      date: "",
      pieceName: "",
      quantity: "",
      gessoSacos: "",
      colaborador: "",
    });
    setIsModalOpen(false);
  };

  // Função para enviar produção para estoque
  const sendProductionToStock = (production: any) => {
    if (onProductionToStock) {
      onProductionToStock(production);
      alert(`✅ Produção de ${production.quantity} ${production.pieceName} enviada para o estoque!`);
    }
  };

  const totalGessoSacos = productions.reduce(
    (total, prod) => total + (Number(prod.gessoSacos) || 0),
    0
  );

  const pieceTotals = getPieceTotals(productions);

  // lista única de colaboradores cadastrados (removendo vazios)
  const colaboradores = Array.from(
    new Set(productions.map((p) => (p.colaborador || "").trim()).filter(Boolean))
  );

  // aplica filtro (se "Todos", mostra tudo)
  const filteredProductions =
    selectedColaborador === "Todos"
      ? productions
      : productions.filter((p) => (p.colaborador || "") === selectedColaborador);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fabricação</h2>
          <p className="text-muted-foreground">
            Monitore a produção de molduras e tabicas.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Nova Produção
        </Button>
      </div>

      {/* Totais por peça (cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.keys(pieceTotals).length === 0 ? (
          <Card className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nenhuma produção ainda</p>
              <h3 className="text-2xl font-bold mt-1">—</h3>
            </div>
          </Card>
        ) : (
          Object.keys(pieceTotals).map((pieceName) => (
            <Card key={pieceName} className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {pieceName.charAt(0).toUpperCase() + pieceName.slice(1)} Produzidas
                </p>
                <h3 className="text-2xl font-bold mt-1">{pieceTotals[pieceName]}</h3>
              </div>
              <Cog className="w-8 h-8 text-muted-foreground" />
            </Card>
          ))
        )}

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sacos de Gesso Usados</p>
            <h3 className="text-2xl font-bold mt-1">{totalGessoSacos}</h3>
          </div>
          <Package className="w-8 h-8 text-muted-foreground" />
        </Card>
      </div>

      {/* FILTRO por colaborador — usando <select> nativo (evita bug de overlay) */}
      <div className="flex items-center gap-4">
        <Label>Filtrar por Colaborador:</Label>

        <select
          value={selectedColaborador}
          onChange={(e) => setSelectedColaborador(e.target.value)}
          className="w-[220px] border rounded-md p-2 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="Todos">Todos</option>
          {colaboradores.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de produções filtradas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProductions.length === 0 ? (
          <div className="col-span-full text-center text-sm text-muted-foreground">
            Nenhuma produção encontrada.
          </div>
        ) : (
          filteredProductions.map((prod) => (
            <Card key={prod.id} className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Data:</strong>{" "}
                  {prod.date ? new Date(prod.date).toLocaleDateString("pt-BR") : "-"}
                </p>
                <p>
                  <strong>Peça:</strong> {prod.pieceName || "-"}
                </p>
                <p>
                  <strong>Quantidade:</strong> {prod.quantity}
                </p>
                <p>
                  <strong>Sacos de Gesso:</strong> {prod.gessoSacos}
                </p>
                <p className="text-green-600 font-semibold">
                  👷 Colaborador: {prod.colaborador || "Não informado"}
                </p>
                {onProductionToStock && (
                  <div className="pt-2 border-t mt-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => sendProductionToStock(prod)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar para Estoque
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de criação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nova Produção</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Data</Label>
              <Input id="date" type="date" value={productionData.date} onChange={handleInputChange} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pieceName" className="text-right">Nome da Peça</Label>
              <Input id="pieceName" value={productionData.pieceName} onChange={handleInputChange} className="col-span-3" placeholder="Ex: tabica 5x3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantidade</Label>
              <Input id="quantity" type="number" value={productionData.quantity} onChange={handleInputChange} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gessoSacos" className="text-right">Sacos de Gesso</Label>
              <Input id="gessoSacos" type="number" value={productionData.gessoSacos} onChange={handleInputChange} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="colaborador" className="text-right">Colaborador / Moldureiro</Label>
              <Input id="colaborador" value={productionData.colaborador} onChange={handleInputChange} className="col-span-3" placeholder="Nome do colaborador" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProduction}>Salvar Produção</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

