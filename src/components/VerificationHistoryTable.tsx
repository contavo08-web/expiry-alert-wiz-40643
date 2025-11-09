import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, History } from "lucide-react";
import { VerificationLog } from "@/types/product";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VerificationHistoryTableProps {
  logs: VerificationLog[];
  onExport: () => void;
}

export const VerificationHistoryTable = ({
  logs,
  onExport,
}: VerificationHistoryTableProps) => {
  const recentLogs = logs.slice(0, 10); // Mostra últimos 10

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Verificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma verificação registrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Verificações ({logs.length} registros)
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data e Hora</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Produtos</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {format(new Date(log.date), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {log.verifiedBy || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-right">{log.productsCount}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.observation || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {logs.length > 10 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Mostrando últimas 10 verificações de {logs.length} registros totais
          </p>
        )}
      </CardContent>
    </Card>
  );
};
