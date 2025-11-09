import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VerificationStatusCardProps {
  lastVerificationDate?: string;
  lastVerifiedBy?: string;
  productsCount?: number;
}

export const VerificationStatusCard = ({
  lastVerificationDate,
  lastVerifiedBy,
  productsCount,
}: VerificationStatusCardProps) => {
  const isVerifiedToday = lastVerificationDate
    ? new Date(lastVerificationDate).toDateString() === new Date().toDateString()
    : false;

  const timeAgo = lastVerificationDate
    ? formatDistanceToNow(new Date(lastVerificationDate), {
        addSuffix: true,
        locale: ptBR,
      })
    : null;

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Status da Verificação Diária
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          {isVerifiedToday ? (
            <>
              <CheckCircle className="h-5 w-5 text-success" />
              <Badge variant="default" className="bg-success text-success-foreground">
                ✅ Verificado Hoje
              </Badge>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-warning" />
              <Badge variant="destructive">
                ⚠️ Aguardando Verificação
              </Badge>
            </>
          )}
        </div>

        {lastVerificationDate && (
          <div className="text-sm space-y-1">
            <p className="text-muted-foreground">
              <span className="font-medium">Última verificação:</span>{" "}
              {new Date(lastVerificationDate).toLocaleString("pt-BR")}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium">Há:</span> {timeAgo}
            </p>
            {lastVerifiedBy && (
              <p className="text-muted-foreground">
                <span className="font-medium">Responsável:</span> {lastVerifiedBy}
              </p>
            )}
            {productsCount !== undefined && (
              <p className="text-muted-foreground">
                <span className="font-medium">Produtos verificados:</span> {productsCount}
              </p>
            )}
          </div>
        )}

        {!lastVerificationDate && (
          <p className="text-sm text-muted-foreground">
            Nenhuma verificação registrada ainda
          </p>
        )}
      </CardContent>
    </Card>
  );
};
