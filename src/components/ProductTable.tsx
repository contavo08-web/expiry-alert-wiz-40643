import { Product } from "@/types/product";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { getStatusLabel, getStatusColor } from "@/utils/productUtils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable = ({ products, onEdit, onDelete }: ProductTableProps) => {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">Nenhum produto cadastrado</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Data de Validade</TableHead>
              <TableHead>Tipo DLC</TableHead>
              <TableHead className="text-center">Dias p/ Vencer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.category}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>
                      {product.expiryDate.includes('T') || product.expiryDate.length > 10
                        ? format(parseISO(product.expiryDate), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : format(parseISO(product.expiryDate), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    {product.expiryDates && product.expiryDates.length > 1 && (
                      <span className="text-xs text-muted-foreground">
                        +{product.expiryDates.length - 1} {product.expiryDates.length - 1 === 1 ? 'data' : 'datas'}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.dlcType}</TableCell>
                <TableCell className="text-center font-semibold">
                  {product.daysToExpiry}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(product.status)}>
                    {getStatusLabel(product.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Horizontal Scroll View */}
      <div className="md:hidden rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs whitespace-nowrap px-3 py-3">Categoria</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap px-3 py-3">Produto</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap px-3 py-3">Data de Validade</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap px-3 py-3">Tipo DLC</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap px-3 py-3 text-center">Dias</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap px-3 py-3">Status</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap px-3 py-3 sticky right-0 bg-muted/50">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="animate-fade-in">
                  <TableCell className="font-medium text-sm whitespace-nowrap px-3 py-4">{product.category}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap px-3 py-4 font-medium">{product.name}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap px-3 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {product.expiryDate.includes('T') || product.expiryDate.length > 10
                          ? format(parseISO(product.expiryDate), "dd/MM/yyyy", { locale: ptBR })
                          : format(parseISO(product.expiryDate), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      {product.expiryDates && product.expiryDates.length > 1 && (
                        <span className="text-xs text-muted-foreground">
                          +{product.expiryDates.length - 1}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap px-3 py-4">
                    <Badge variant="outline" className="text-xs">{product.dlcType}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold text-sm whitespace-nowrap px-3 py-4">
                    {product.daysToExpiry}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-4">
                    <Badge className={`${getStatusColor(product.status)} text-xs font-medium`}>
                      {getStatusLabel(product.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-4 sticky right-0 bg-card shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                        className="h-8 w-8 hover-scale active:scale-95"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(product.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 hover-scale active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground text-center border-t">
          Deslize horizontalmente para ver mais →
        </div>
      </div>
    </>
  );
};
