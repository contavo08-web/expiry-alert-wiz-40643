import { Product, StatusType, Summary } from "@/types/product";
import { differenceInDays, parseISO, startOfDay } from "date-fns";

export const calculateDaysToExpiry = (expiryDate: string): number => {
  // Verifica se a data inclui hora (formato datetime-local)
  const hasTime = expiryDate.includes('T') || expiryDate.length > 10;
  
  if (hasTime) {
    // Para datas com hora, calcula diferença em dias com precisão de horas
    const now = new Date();
    const expiry = parseISO(expiryDate);
    const diffInMilliseconds = expiry.getTime() - now.getTime();
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
    return Math.floor(diffInDays);
  } else {
    // Para datas sem hora, usa o cálculo original
    const today = startOfDay(new Date());
    const expiry = startOfDay(parseISO(expiryDate));
    return differenceInDays(expiry, today);
  }
};

export const calculateStatus = (daysToExpiry: number): StatusType => {
  if (daysToExpiry < 0) return "expired";
  if (daysToExpiry === 0) return "today";
  if (daysToExpiry <= 3) return "critical";
  if (daysToExpiry <= 7) return "warning";
  return "ok";
};

export const getStatusLabel = (status: StatusType): string => {
  const labels: Record<StatusType, string> = {
    expired: "Vencido",
    today: "Vence Hoje",
    critical: "Alerta Crítico",
    warning: "Vence em Breve",
    ok: "OK",
  };
  return labels[status];
};

export const getStatusColor = (status: StatusType): string => {
  const colors: Record<StatusType, string> = {
    expired: "bg-expired text-expired-foreground",
    today: "bg-warning text-warning-foreground",
    critical: "bg-destructive text-destructive-foreground animate-pulse",
    warning: "bg-warning/80 text-warning-foreground",
    ok: "bg-success/20 text-success border border-success/30",
  };
  return colors[status];
};

export const calculateSummary = (products: Product[]): Summary => {
  const total = products.length;
  const expired = products.filter((p) => p.status === "expired").length;
  const expiringToday = products.filter((p) => p.status === "today").length;
  const expiringIn7Days = products.filter((p) => p.status === "warning" || p.status === "critical").length;
  const ok = products.filter((p) => p.status === "ok").length;
  const conformityRate = total > 0 ? Math.round((ok / total) * 100) : 0;

  return {
    total,
    expired,
    expiringToday,
    expiringIn7Days,
    ok,
    conformityRate,
  };
};

export const updateProductCalculations = (product: Omit<Product, "daysToExpiry" | "status">): Product => {
  // Se houver múltiplas datas, usa a mais próxima do vencimento
  const dates = product.expiryDates && product.expiryDates.length > 0 
    ? product.expiryDates 
    : [product.expiryDate];
  
  const daysToExpiryList = dates.map(calculateDaysToExpiry);
  const daysToExpiry = Math.min(...daysToExpiryList);
  const status = calculateStatus(daysToExpiry);
  
  // Atualiza a expiryDate principal para a data mais próxima
  const closestDate = dates[daysToExpiryList.indexOf(daysToExpiry)];
  
  return {
    ...product,
    expiryDate: closestDate,
    daysToExpiry,
    status,
  };
};