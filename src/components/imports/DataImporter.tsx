import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Camera, 
  Download, 
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { pipeline, env } from '@huggingface/transformers';
import { Product, Sale, SaleItem } from "../sales/types";

// Configure transformers to use browser cache
env.allowLocalModels = false;
env.useBrowserCache = true;

interface DataImporterProps {
  onProductsImported: (products: Product[]) => void;
  onSalesImported: (sales: Sale[]) => void;
}

export function DataImporter({ onProductsImported, onSalesImported }: DataImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [ocrResults, setOcrResults] = useState<string[]>([]);

  // Função para importar produtos do Excel
  const handleProductsImport = async (file: File) => {
    try {
      setIsProcessing(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const products: Product[] = jsonData.map((row: any, index: number) => ({
        id: Date.now() + index,
        name: row.nome || row.name || row.produto || `Produto ${index + 1}`,
        price: parseFloat(row.preco || row.price || row.valor) || 0,
        cost: parseFloat(row.custo || row.cost) || 0,
        stock: parseInt(row.estoque || row.stock || row.quantidade) || 0,
        category: row.categoria || row.category || "Importado",
        description: row.descricao || row.description || "",
        barcode: row.codigo || row.barcode || "",
      }));

      onProductsImported(products);
      toast.success(`${products.length} produtos importados com sucesso!`);
    } catch (error) {
      console.error("Erro ao importar produtos:", error);
      toast.error("Erro ao importar produtos. Verifique o formato do arquivo.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para importar vendas do Excel
  const handleSalesImport = async (file: File) => {
    try {
      setIsProcessing(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const sales: Sale[] = jsonData.map((row: any, index: number) => ({
        id: Date.now() + index,
        date: row.data || row.date || new Date().toISOString().split('T')[0],
        products: [
          {
            name: row.produto || row.product || `Produto ${index + 1}`,
            quantity: parseInt(row.quantidade || row.quantity) || 1,
            price: parseFloat(row.preco || row.price) || 0,
          }
        ],
        total: parseFloat(row.total || row.valor) || 0,
        profit: parseFloat(row.lucro || row.profit) || 0,
        paymentMethod: row.pagamento || row.payment || "pix",
        amountPaid: parseFloat(row.pago || row.paid) || 0,
        change: parseFloat(row.troco || row.change) || 0,
        status: "pago" as const,
        customer: {
          id: 0,
          name: row.cliente || row.customer || "Cliente Importado",
        },
      }));

      onSalesImported(sales);
      toast.success(`${sales.length} vendas importadas com sucesso!`);
    } catch (error) {
      console.error("Erro ao importar vendas:", error);
      toast.error("Erro ao importar vendas. Verifique o formato do arquivo.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Função OCR para ler texto de imagens
  const handleOCR = async (file: File) => {
    try {
      setIsProcessing(true);
      toast.info("Processando imagem com OCR...");

      // Criar URL da imagem
      const imageUrl = URL.createObjectURL(file);
      
      // Usar modelo OCR do HuggingFace
      const detector = await pipeline('object-detection', 'facebook/detr-resnet-50', {
        device: 'webgpu'
      });

      // Para OCR de texto, usaremos um modelo específico
      const ocr = await pipeline('image-to-text', 'nlpconnect/vit-gpt2-image-captioning', {
        device: 'webgpu'
      });

      const result = await ocr(imageUrl);
      
      let extractedText = "";
      if (Array.isArray(result)) {
        extractedText = result.map((r: any) => r.generated_text || r.text || "").join(" ");
      } else if (result && typeof result === 'object') {
        extractedText = (result as any).generated_text || (result as any).text || "Texto não reconhecido";
      } else {
        extractedText = String(result) || "Texto não reconhecido";
      }

      setOcrText(extractedText);
      setOcrResults(prev => [...prev, extractedText]);
      
      toast.success("OCR processado com sucesso!");
      
      // Cleanup
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error("Erro no OCR:", error);
      toast.error("Erro ao processar imagem. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse OCR text para criar produtos/vendas
  const parseOCRToProducts = () => {
    try {
      const lines = ocrText.split('\n').filter(line => line.trim());
      const products: Product[] = [];

      lines.forEach((line, index) => {
        const words = line.split(' ');
        const price = words.find(word => word.includes('R$') || /\d+[.,]\d+/.test(word));
        
        if (price) {
          const priceValue = parseFloat(price.replace('R$', '').replace(',', '.')) || 0;
          const name = line.replace(price, '').trim() || `Produto ${index + 1}`;
          
          products.push({
            id: Date.now() + index,
            name,
            price: priceValue,
            cost: priceValue * 0.7, // Estimativa de 30% de margem
            stock: 1,
            category: "Caderno",
            description: `Produto extraído do caderno via OCR`,
          });
        }
      });

      if (products.length > 0) {
        onProductsImported(products);
        toast.success(`${products.length} produtos extraídos do OCR!`);
      } else {
        toast.warning("Nenhum produto encontrado no texto OCR");
      }
    } catch (error) {
      console.error("Erro ao processar OCR:", error);
      toast.error("Erro ao processar texto OCR");
    }
  };

  // Exportar template Excel
  const exportTemplate = (type: 'products' | 'sales') => {
    let template: any[] = [];
    let filename = "";

    if (type === 'products') {
      template = [
        {
          nome: "Produto Exemplo",
          preco: 10.99,
          custo: 7.50,
          estoque: 100,
          categoria: "Categoria",
          descricao: "Descrição do produto",
          codigo: "123456"
        }
      ];
      filename = "template_produtos.xlsx";
    } else {
      template = [
        {
          data: "2024-01-01",
          produto: "Produto Exemplo",
          quantidade: 1,
          preco: 10.99,
          total: 10.99,
          lucro: 3.49,
          pagamento: "pix",
          cliente: "Cliente Exemplo"
        }
      ];
      filename = "template_vendas.xlsx";
    }

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'products' ? 'Produtos' : 'Vendas');
    XLSX.writeFile(wb, filename);
    
    toast.success(`Template ${type === 'products' ? 'de produtos' : 'de vendas'} baixado!`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importação e OCR de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="excel">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="excel">Excel/CSV</TabsTrigger>
              <TabsTrigger value="ocr">OCR Caderno</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="excel" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Importar Produtos */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        <h3 className="font-semibold">Importar Produtos</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Importe produtos de planilha Excel (.xlsx, .xls)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleProductsImport(file);
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
                            Selecionar Arquivo
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Importar Vendas */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <h3 className="font-semibold">Importar Vendas</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Importe histórico de vendas de planilha Excel
                      </p>
                      <Button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.xlsx,.xls,.csv';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleSalesImport(file);
                          };
                          input.click();
                        }}
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
                            Selecionar Arquivo
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ocr" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <h3 className="font-semibold">OCR - Ler Caderno de Vendas</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Fotografe ou selecione imagem do seu caderno para extrair produtos e preços
                    </p>
                    
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleOCR(file);
                      }}
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isProcessing}
                        variant="outline"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Fotografar
                      </Button>
                      <Button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleOCR(file);
                          };
                          input.click();
                        }}
                        disabled={isProcessing}
                        variant="outline"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Galeria
                      </Button>
                    </div>

                    {isProcessing && (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Processando imagem com IA...</span>
                      </div>
                    )}

                    {ocrText && (
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-muted/50">
                          <Label className="font-semibold">Texto Extraído:</Label>
                          <p className="text-sm mt-2 whitespace-pre-wrap">{ocrText}</p>
                        </div>
                        <Button 
                          onClick={parseOCRToProducts}
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Converter em Produtos
                        </Button>
                      </div>
                    )}

                    {ocrResults.length > 0 && (
                      <div className="space-y-2">
                        <Label className="font-semibold">Histórico de OCR:</Label>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {ocrResults.map((result, index) => (
                            <div key={index} className="p-2 border rounded text-xs">
                              {result.substring(0, 100)}...
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <h3 className="font-semibold">Template Produtos</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Baixe o modelo para importar produtos
                      </p>
                      <Button 
                        onClick={() => exportTemplate('products')}
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
                        <Download className="w-4 h-4" />
                        <h3 className="font-semibold">Template Vendas</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Baixe o modelo para importar vendas
                      </p>
                      <Button 
                        onClick={() => exportTemplate('sales')}
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

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Instruções de Uso:</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Use os templates para garantir o formato correto</li>
                        <li>• Colunas obrigatórias: nome/produto, preço/valor</li>
                        <li>• Para OCR: fotografe textos claros e bem iluminados</li>
                        <li>• Suportados: Excel (.xlsx, .xls), CSV, imagens (JPG, PNG)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}