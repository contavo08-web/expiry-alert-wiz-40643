import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, DLCType } from "@/types/product";
import { format } from "date-fns";
import { Plus, X } from "lucide-react";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Omit<Product, "id" | "daysToExpiry" | "status">) => void;
  product?: Product;
}

export const ProductDialog = ({ open, onOpenChange, onSave, product }: ProductDialogProps) => {
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    expiryDate: "",
    dlcType: "Primária" as DLCType,
    observation: "",
  });
  const [additionalDates, setAdditionalDates] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        category: product.category,
        name: product.name,
        expiryDate: product.expiryDate,
        dlcType: product.dlcType,
        observation: product.observation || "",
      });
      // Filter out the primary expiryDate from additionalDates for editing
      setAdditionalDates(product.expiryDates?.filter(d => d !== product.expiryDate) || []);
    } else {
      setFormData({
        category: "",
        name: "",
        expiryDate: "",
        dlcType: "Primária",
        observation: "",
      });
      setAdditionalDates([]);
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Function to ensure date string includes time, defaulting to midnight
    const ensureTime = (dateString: string) => {
      if (!dateString) return ""; // Handle empty string
      if (dateString.includes('T')) {
        return dateString; // Already has time
      }
      return `${dateString}T00:00`; // Append midnight time
    };

    const primaryExpiryDateWithTime = ensureTime(formData.expiryDate);
    const additionalDatesWithTime = additionalDates.map(ensureTime);

    const allDates = [primaryExpiryDateWithTime, ...additionalDatesWithTime.filter(d => d)];
    
    onSave({
      ...formData,
      expiryDate: primaryExpiryDateWithTime, // Update primary expiryDate with time
      expiryDates: allDates,
    });
    onOpenChange(false);
  };

  const addDateField = () => {
    setAdditionalDates([...additionalDates, ""]);
  };

  const removeDateField = (index: number) => {
    setAdditionalDates(additionalDates.filter((_, i) => i !== index));
  };

  const updateAdditionalDate = (index: number, value: string) => {
    const updated = [...additionalDates];
    updated[index] = value;
    setAdditionalDates(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{product ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Pães, Frescos, Bebidas"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Produto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do produto"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="expiryDate">
                  Data de Validade
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addDateField}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Data
                </Button>
              </div>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
              {additionalDates.map((date, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="date"
                    value={date.split('T')[0]}
                    onChange={(e) => updateAdditionalDate(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDateField(index)}
                    className="h-10 w-10 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dlcType">Tipo DLC</Label>
              <Select
                value={formData.dlcType}
                onValueChange={(value: DLCType) => setFormData({ ...formData, dlcType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primária">Primária</SelectItem>
                  <SelectItem value="Secundária">Secundária</SelectItem>
                  <SelectItem value="Stock">Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="observation">Observação (opcional)</Label>
              <Input
                id="observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                placeholder="Observações adicionais"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{product ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};