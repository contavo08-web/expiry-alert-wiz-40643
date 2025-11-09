export type DLCType = "Primária" | "Secundária" | "Stock";

export type StatusType = "expired" | "today" | "warning" | "critical" | "ok";

export interface Product {
  id: string;
  category: string;
  name: string;
  expiryDate: string;
  expiryDates?: string[]; // múltiplas datas de validade
  dlcType: DLCType;
  daysToExpiry: number;
  status: StatusType;
  observation?: string;
}

export interface Summary {
  total: number;
  expired: number;
  expiringToday: number;
  expiringIn7Days: number;
  ok: number;
  conformityRate: number;
}

export interface VerificationLog {
  id: string;
  date: string; // data e hora da verificação ISO string
  verifiedBy?: string; // nome do responsável
  observation?: string; // observações da verificação
  productsCount: number; // quantos produtos foram verificados
}
