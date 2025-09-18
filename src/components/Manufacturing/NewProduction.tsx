// src/components/Manufacturing/NewProduction.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewProductionProps {
  onTabChange: (tab: string) => void;
}

export function NewProduction({ onTabChange }: NewProductionProps) {
  const [colaborador, setColaborador] = useState("");

  const handleSave = () => {
    const novaProducao = {
      colaborador, // aqui vai o nome do colaborador/moldureiro
      // depois você pode incluir outros campos da produção
    };
    console.log("Nova produção:", novaProducao);
    // aqui você pode enviar para API ou salvar no estado global
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nova Produção</h2>
          <p className="text-muted-foreground">
            Adicione uma nova produção de gesso.
          </p>
        </div>
        <Button onClick={() => onTabChange("manufacturing")}>Voltar</Button>
      </div>

      {/* Formulário */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="colaborador">Colaborador / Moldureiro</Label>
          <Input
            id="colaborador"
            value={colaborador}
            onChange={(e) => setColaborador(e.target.value)}
            placeholder="Digite o nome"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar Produção</Button>
        </div>
      </div>
    </div>
  );
}
