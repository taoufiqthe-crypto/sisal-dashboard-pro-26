import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Calendar, ShoppingCart, Trash2 } from "lucide-react";
import { Sale, paymentMethods } from "./types";

interface SalesHistoryProps {
  sales: Sale[];
  formatCurrency: (value: number) => string;
  onSaleDeleted?: (saleId: string | number) => void;
}

export function SalesHistory({ sales, formatCurrency, onSaleDeleted }: SalesHistoryProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <Calendar className="w-5 h-5" />
        <span>Histórico de Vendas</span>
      </h3>

      {sales.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma venda registrada</h3>
          <p className="text-muted-foreground">Comece registrando sua primeira venda</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {sales.map((sale) => {
            const paymentMethodInfo = paymentMethods.find((p) => p.type === sale.paymentMethod);

            return (
              <AccordionItem key={sale.id} value={`sale-${sale.id}`}>
                <AccordionTrigger className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">#{sale.id}</Badge>
                    <span>{sale.date}</span>

                    {/* Cliente */}
                    {sale.customer && (
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span>👤 {sale.customer.name}</span>
                        {sale.customer.phone && <span>📞 {sale.customer.phone}</span>}
                        {sale.customer.email && <span>✉️ {sale.customer.email}</span>}
                      </div>
                    )}

                    <span>{paymentMethodInfo?.icon}</span>
                    <span>{paymentMethodInfo?.label}</span>
                  </div>
                  <div className="font-bold text-revenue">{formatCurrency(sale.total)}</div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {sale.products.map((product, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{product.name}</span>
                        <span>
                          {product.quantity} x {formatCurrency(product.price)}
                        </span>
                      </div>
                    ))}

                    <div className="border-t pt-2 mt-2 text-sm grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-semibold text-revenue">{formatCurrency(sale.total)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lucro</p>
                        <p className="font-semibold text-profit">{formatCurrency(sale.profit)}</p>
                      </div>
                      {sale.change > 0 && (
                        <div>
                          <p className="text-muted-foreground">Troco</p>
                          <p className="font-semibold text-warning">{formatCurrency(sale.change)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="success" className="text-xs">Pago</Badge>
                      </div>
                      {onSaleDeleted && (
                        <div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Deseja realmente deletar esta venda?')) {
                                onSaleDeleted(sale.id);
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Deletar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </Card>
  );
}
