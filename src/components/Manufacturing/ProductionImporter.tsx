import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  FileSpreadsheet, 
  Download,
  Factory,
  Package,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface ProductionOrder {
  id: number;
  orderNumber: string;
  product: string;
  quantity: number;
  priority: 'baixa' | 'normal' | 'alta' | 'urgente';
  dueDate: string;
  status: 'pendente' | 'em_producao' | 'concluido' | 'pausado';
  customer: string;
  materials: Array<{
    material: string;
    quantity: number;
    unit: string;
  }>;
  notes?: string;
}

interface ProductionImporterProps {
  onOrdersImported: (orders: ProductionOrder[]) => void;
}

export function ProductionImporter({ onOrdersImported }: ProductionImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Importar ordens de produção do Excel
  const handleImportOrders = async (file: File) => {
    try {
      setIsProcessing(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const orders: ProductionOrder[] = jsonData.map((row: any, index: number) => ({
        id: Date.now() + index,
        orderNumber: row.numero_pedido || row.order_number || `OP-${Date.now()}-${index}`,
        product: row.produto || row.product || `Produto ${index + 1}`,
        quantity: parseInt(row.quantidade || row.quantity) || 1,
        priority: (row.prioridade || row.priority || 'normal') as any,
        dueDate: row.data_entrega || row.due_date || new Date().toISOString().split('T')[0],
        status: (row.status || 'pendente') as any,
        customer: row.cliente || row.customer || 'Cliente Não Informado',
        materials: [
          {
            material: row.material_1 || row.material || 'Material Principal',
            quantity: parseFloat(row.qtd_material_1 || row.material_qty) || 1,
            unit: row.unidade_1 || row.unit || 'kg'
          }
        ],
        notes: row.observacoes || row.notes || ''
      }));

      onOrdersImported(orders);
      toast.success(`${orders.length} ordens de produção importadas com sucesso!`);
    } catch (error) {
      console.error("Erro ao importar ordens:", error);
      toast.error("Erro ao importar ordens. Verifique o formato do arquivo.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Exportar template para ordens de produção
  const exportTemplate = () => {
    const template = [
      {
        numero_pedido: "OP-2024-001",
        produto: "Gesso Comum 40kg",
        quantidade: 50,
        prioridade: "normal",
        data_entrega: "2024-01-15",
        status: "pendente",
        cliente: "Construtora XYZ",
        material_1: "Gipsita",
        qtd_material_1: 30,
        unidade_1: "kg",
        material_2: "Aditivo",
        qtd_material_2: 2,
        unidade_2: "kg",
        observacoes: "Produto para obra urgente"
      },
      {
        numero_pedido: "OP-2024-002",
        produto: "Gesso Fino 20kg",
        quantidade: 100,
        prioridade: "alta",
        data_entrega: "2024-01-20",
        status: "pendente",
        cliente: "Distribuidora ABC",
        material_1: "Gipsita Fina",
        qtd_material_1: 18,
        unidade_1: "kg",
        material_2: "Retardante",
        qtd_material_2: 0.5,
        unidade_2: "kg",
        observacoes: "Embalagem especial"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ordens_Producao');
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 15 }, // numero_pedido
      { wch: 20 }, // produto
      { wch: 10 }, // quantidade
      { wch: 12 }, // prioridade
      { wch: 12 }, // data_entrega
      { wch: 12 }, // status
      { wch: 20 }, // cliente
      { wch: 15 }, // material_1
      { wch: 12 }, // qtd_material_1
      { wch: 10 }, // unidade_1
      { wch: 15 }, // material_2
      { wch: 12 }, // qtd_material_2
      { wch: 10 }, // unidade_2
      { wch: 30 }, // observacoes
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, "template_ordens_producao.xlsx");
    toast.success("Template de ordens de produção baixado!");
  };

  // Exportar template para materiais/estoque
  const exportMaterialsTemplate = () => {
    const template = [
      {
        codigo: "MAT-001",
        material: "Gipsita",
        categoria: "Matéria Prima",
        estoque_atual: 1000,
        estoque_minimo: 100,
        unidade: "kg",
        preco_custo: 0.85,
        fornecedor: "Mineração Alfa",
        localizacao: "Galpão A - Setor 1"
      },
      {
        codigo: "MAT-002",
        material: "Aditivo Retardante",
        categoria: "Aditivo",
        estoque_atual: 50,
        estoque_minimo: 10,
        unidade: "kg",
        preco_custo: 12.50,
        fornecedor: "Química Beta",
        localizacao: "Galpão B - Setor 2"
      },
      {
        codigo: "MAT-003",
        material: "Sacos 40kg",
        categoria: "Embalagem",
        estoque_atual: 500,
        estoque_minimo: 50,
        unidade: "un",
        preco_custo: 0.75,
        fornecedor: "Embalagens Gama",
        localizacao: "Almoxarifado"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Materiais');
    
    const colWidths = [
      { wch: 12 }, // codigo
      { wch: 25 }, // material
      { wch: 15 }, // categoria
      { wch: 15 }, // estoque_atual
      { wch: 15 }, // estoque_minimo
      { wch: 10 }, // unidade
      { wch: 12 }, // preco_custo
      { wch: 20 }, // fornecedor
      { wch: 25 }, // localizacao
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, "template_materiais.xlsx");
    toast.success("Template de materiais baixado!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Importação de Dados de Fabricação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seção de Importação */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Importar Ordens de Produção */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <h3 className="font-semibold">Ordens de Produção</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Importe ordens de produção de planilha Excel
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportOrders(file);
                    }}
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Importar Ordens
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Importar Materiais */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <h3 className="font-semibold">Materiais/Estoque</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Importe controle de materiais e estoque
                  </p>
                  
                  <Button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.xlsx,.xls,.csv';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // Aqui você pode implementar a importação de materiais
                          toast.info("Funcionalidade de importação de materiais em desenvolvimento");
                        }
                      };
                      input.click();
                    }}
                    disabled={isProcessing}
                    className="w-full"
                    variant="outline"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Materiais
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Templates */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Templates para Download
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <h4 className="font-semibold">Template Ordens de Produção</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Modelo completo com todos os campos necessários
                    </p>
                    <Button 
                      onClick={exportTemplate}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Template
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <h4 className="font-semibold">Template Materiais</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Controle de materiais, estoque e fornecedores
                    </p>
                    <Button 
                      onClick={exportMaterialsTemplate}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Instruções */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Instruções para Importação:</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• <strong>Ordens de Produção:</strong> numero_pedido, produto, quantidade, data_entrega são obrigatórios</li>
                    <li>• <strong>Status válidos:</strong> pendente, em_producao, concluido, pausado</li>
                    <li>• <strong>Prioridades:</strong> baixa, normal, alta, urgente</li>
                    <li>• <strong>Materiais:</strong> até 5 materiais por ordem (material_1, material_2, etc.)</li>
                    <li>• <strong>Datas:</strong> use formato AAAA-MM-DD (ex: 2024-01-15)</li>
                    <li>• <strong>Arquivos:</strong> Excel (.xlsx, .xls) ou CSV separado por vírgula</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}