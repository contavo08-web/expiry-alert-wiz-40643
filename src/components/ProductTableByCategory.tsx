import { Product } from "@/types/product";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { getStatusColor, getStatusLabel } from "@/utils/productUtils";

interface ProductTableByCategoryProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTableByCategory = ({ products, onEdit, onDelete }: ProductTableByCategoryProps) => {
  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Define the custom order for categories
  const customCategoryOrder = [
    "McCafé",
    "Queijos",
    "Molhos",
    "Pães",
    "Sobremesas",
    "Outros",
  ];

  // Sort categories based on the custom order, placing unknown categories at the end
  const categories = Object.keys(groupedProducts).sort((a, b) => {
    const indexA = customCategoryOrder.indexOf(a);
    const indexB = customCategoryOrder.indexOf(b);

    if (indexA === -1 && indexB === -1) {
      return a.localeCompare(b); // Sort alphabetically if both are not in custom order
    }
    if (indexA === -1) {
      return 1; // 'a' is not in custom order, so it comes after 'b'
    }
    if (indexB === -1) {
      return -1; // 'b' is not in custom order, so it comes after 'a'
    }
    return indexA - indexB; // Sort by custom order
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum produto encontrado. Use o botão "Adicionar Produtos do Dia" para começar.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category} className="rounded-lg border bg-card overflow-hidden">
          <div className="bg-muted px-4 py-3">
            <h3 className="font-semibold text-lg text-foreground">{category}</h3>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Data de Validade</TableHead>
                  <TableHead>Tipo DLC</TableHead>
                  <TableHead>Dias p/ Vencer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedProducts[category].map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>
                          {product.expiryDate.includes('T') || product.expiryDate.length > 10
                            ? new Date(product.expiryDate).toLocaleString("pt-PT", { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : new Date(product.expiryDate).toLocaleDateString("pt-PT")}
                        </span>
                        {product.expiryDates && product.expiryDates.length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            +{product.expiryDates.length - 1} {product.expiryDates.length - 1 === 1 ? 'data' : 'datas'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.dlcType}</TableCell>
                    <TableCell>{product.daysToExpiry}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.status)}>{getStatusLabel(product.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.observation || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {groupedProducts[category].map((product) => (
              <div 
                key={product.id} 
                className="p-4 space-y-3 transition-all duration-200 active:bg-accent/50 hover:bg-accent/30 animate-fade-in"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge className={`${getStatusColor(product.status)} transition-all duration-200`}>
                        {getStatusLabel(product.status)}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        {product.daysToExpiry} dias
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(product)}
                      className="h-9 w-9 hover-scale transition-all active:scale-95"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDelete(product.id)}
                      className="h-9 w-9 hover-scale transition-all active:scale-95 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-start gap-3 p-2 rounded-md bg-muted/30 transition-colors duration-200">
                    <span className="text-muted-foreground font-medium">Data de Validade:</span>
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-foreground">
                        {product.expiryDate.includes('T') || product.expiryDate.length > 10
                          ? new Date(product.expiryDate).toLocaleString("pt-PT", { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : new Date(product.expiryDate).toLocaleDateString("pt-PT")}
                      </span>
                      {product.expiryDates && product.expiryDates.length > 1 && (
                        <span className="text-xs text-muted-foreground mt-0.5 font-medium">
                          +{product.expiryDates.length - 1} {product.expiryDates.length - 1 === 1 ? 'data' : 'datas'}
                        </span>
                      )}
                    </div>
                  </div>
                  {product.observation && (
                    <div className="flex justify-between items-start gap-3 p-2 rounded-md bg-muted/30 transition-colors duration-200">
                      <span className="text-muted-foreground font-medium">Observação:</span>
                      <span className="font-medium text-foreground text-right">{product.observation}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};