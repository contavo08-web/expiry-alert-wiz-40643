import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (verifiedBy: string, observation: string) => void;
  productsCount: number;
}

export const VerificationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  productsCount,
}: VerificationDialogProps) => {
  const [verifiedBy, setVerifiedBy] = useState("");
  const [observation, setObservation] = useState("");

  const handleConfirm = () => {
    onConfirm(verifiedBy, observation);
    setVerifiedBy("");
    setObservation("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirmar Verificação Diária</DialogTitle>
          <DialogDescription>
            Registre a verificação dos produtos DLC Secundária de hoje.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Data e hora:</span>{" "}
              {new Date().toLocaleString("pt-BR")}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Produtos a verificar:</span>{" "}
              {productsCount} itens
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verifiedBy">Nome do Responsável (opcional)</Label>
            <Input
              id="verifiedBy"
              placeholder="Digite seu nome"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observações (opcional)</Label>
            <Textarea
              id="observation"
              placeholder="Alguma observação sobre a verificação..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar Verificação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
