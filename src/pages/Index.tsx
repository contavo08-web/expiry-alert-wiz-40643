import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SummaryCard } from "@/components/SummaryCard";
import { ProductTableByCategory } from "@/components/ProductTableByCategory";
import { ProductDialog } from "@/components/ProductDialog";
import { VerificationStatusCard } from "@/components/VerificationStatusCard";
import { VerificationDialog } from "@/components/VerificationDialog";
import { VerificationHistoryTable } from "@/components/VerificationHistoryTable";
import { Product, DLCType, VerificationLog } from "@/types/product";
import { calculateSummary, updateProductCalculations } from "@/utils/productUtils";
import { Plus, Search, Package, AlertTriangle, Calendar, CheckCircle, ClipboardCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { secundariaProducts } from "@/utils/secundariaProducts";
import { primariaDefaultProducts } from "@/utils/primariaDefaultProducts";
import { dlcNegativaProteinasDefaultProducts } from "@/utils/dlcNegativaProteinasDefaultProducts";

// Definindo uma interface para os itens de produto padrão
interface DefaultProductItem {
  id: string; // Adicionando ID para produtos padrão
  category: string;
  name: string;
  subCategory?: string;
  expiryDate?: string;
  dlcType?: DLCType;
  observation?: string;
}

// Helper para gerar um ID estável para produtos padrão
const generateStableId = (category: string, name: string, dlcType: DLCType) => {
  // Usa Base64 para criar um ID único e consistente a partir dos atributos do produto
  return btoa(`${category}-${name}-${dlcType}`);
};

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  
  // Verification states
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [lastVerification, setLastVerification] = useState<VerificationLog | null>(null);

  // Load products from localStorage and merge with default products
  useEffect(() => {
    const stored = localStorage.getItem("products");
    let userManagedProducts: Product[] = [];
    if (stored) {
      userManagedProducts = JSON.parse(stored);
    }

    // Define todos os produtos padrão com IDs estáveis
    const allDefaultProducts: DefaultProductItem[] = [
      ...primariaDefaultProducts.map(item => {
        const dlcType: DLCType = "Primária"; // Define dlcType explicitamente
        return {
          ...item,
          id: generateStableId(item.category, item.name, dlcType),
          dlcType: dlcType,
        };
      }),
      ...dlcNegativaProteinasDefaultProducts.map(item => {
        const dlcType: DLCType = "Primária"; // Define dlcType explicitamente
        return {
          ...item,
          id: generateStableId(item.category, item.name, dlcType),
          dlcType: dlcType,
        };
      }),
      // Produtos DLC Secundária agora também são padrão fixos
      ...secundariaProducts.map(item => {
        const dlcType: DLCType = "Secundária"; // Define dlcType explicitamente
        const expiryDate = "2025-12-01T00:00"; // Define expiryDate padrão
        return {
          ...item,
          id: generateStableId(item.category, item.name, dlcType),
          dlcType: dlcType,
          expiryDate: expiryDate,
        };
      }),
      // Exemplo de produto com subcategoria
      { id: generateStableId("DLC Positiva", "Alface L6", "Primária"), category: "DLC Positiva", subCategory: "Frescos", name: "Alface L6", expiryDate: "2025-12-10T18:00", dlcType: "Primária", observation: "Exemplo com subcategoria" },
      { id: generateStableId("DLC Positiva", "Batata Frita", "Primária"), category: "DLC Positiva", subCategory: "Congelados", name: "Batata Frita", expiryDate: "2025-12-20T00:00", dlcType: "Primária", observation: "Outro exemplo" },
    ];

    const finalProductsMap = new Map<string, Product>(); // Chave: product.id

    // 1. Adiciona todos os produtos gerenciados pelo usuário primeiro.
    // Estes têm precedência para itens existentes (mantém edições do usuário).
    userManagedProducts.forEach(p => {
      finalProductsMap.set(p.id, updateProductCalculations(p));
    });

    // 2. Adiciona produtos padrão. Se um produto padrão (pelo ID) já existir
    // nos produtos gerenciados pelo usuário (e, portanto, em finalProductsMap),
    // sua versão modificada pelo usuário é mantida. Caso contrário, a versão padrão é adicionada.
    allDefaultProducts.forEach(item => {
      if (!finalProductsMap.has(item.id)) {
        finalProductsMap.set(item.id, updateProductCalculations({
          id: item.id, // Usa o ID estável
          category: item.category,
          subCategory: item.subCategory,
          name: item.name,
          expiryDate: item.expiryDate || "2025-12-01T00:00", // Fornece uma data de validade padrão
          dlcType: item.dlcType || "Primária", // Fornece um tipo DLC padrão
          observation: item.observation,
        }));
      }
    });

    setProducts(Array.from(finalProductsMap.values()));

    // Load verification logs (lógica existente)
    const storedLogs = localStorage.getItem("verificationLogs");
    if (storedLogs) {
      const logs = JSON.parse(storedLogs);
      setVerificationLogs(logs);
      if (logs.length > 0) {
        setLastVerification(logs[0]);
      }
    }
  }, []); // Array de dependência vazio significa que isso é executado uma vez na montagem

  // Save products to localStorage
  useEffect(() => {
    // Salva todos os produtos, incluindo os padrão (se modificados) e os adicionados pelo usuário
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // Save verification logs to localStorage
  useEffect(() => {
    if (verificationLogs.length > 0) {
      localStorage.setItem("verificationLogs", JSON.stringify(verificationLogs));
    } else {
      localStorage.removeItem("verificationLogs");
    }
  }, [verificationLogs]);

  // Check if verification is needed (show toast if not verified today after 12:00)
  useEffect(() => {
    const checkVerification = () => {
      const now = new Date();
      const isAfterNoon = now.getHours() >= 12;
      const isVerifiedToday = lastVerification
        ? new Date(lastVerification.date).toDateString() === now.toDateString()
        : false;

      if (isAfterNoon && !isVerifiedToday) {
        toast.warning("⚠️ Verificação DLC Secundária Pendente", {
          description: "Lembre-se de registrar a verificação diária dos produtos.",
          duration: 10000,
        });
      }
    };

    // Check on mount and every hour
    checkVerification();
    const interval = setInterval(checkVerification, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, [lastVerification]);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(searchTerm.toLowerCase())) // Incluir subCategory na busca
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const summary = calculateSummary(products);
  const summaryPrimaria = calculateSummary(products.filter(p => p.dlcType === "Primária"));
  const summarySecundaria = calculateSummary(products.filter(p => p.dlcType === "Secundária"));
  const categories = Array.from(new Set(products.map((p) => p.category)));

  const handleSave = (productData: Omit<Product, "id" | "daysToExpiry" | "status">) => {
    if (editingProduct) {
      const updated = updateProductCalculations({
        ...productData,
        id: editingProduct.id,
      });
      setProducts(products.map((p) => (p.id === editingProduct.id ? updated : p)));
      toast.success("Produto atualizado com sucesso!");
    } else {
      const newProduct = updateProductCalculations({
        ...productData,
        id: crypto.randomUUID(),
      });
      setProducts([...products, newProduct]);
      toast.success("Produto adicionado com sucesso!");
    }
    setEditingProduct(undefined);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("Produto removido com sucesso!");
  };

  const handleAddNew = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  // A função handleAddSecundariaProducts foi removida, pois esses produtos agora são fixos.
  // O botão "Adicionar Produtos do Dia" será substituído por "Renovar DLC Secundária".

  const handleRenewSecundariaProducts = () => {
    // Para DLC Secundária, usa datetime-local com hora atual
    const now = new Date();
    const today = now.toISOString().slice(0, 16); // formato datetime-local
    const updatedProducts = products.map(p => {
      if (p.dlcType === "Secundária") {
        return updateProductCalculations({
          ...p,
          expiryDate: today,
        });
      }
      return p;
    });
    setProducts(updatedProducts);
    toast.success("Datas e horas dos produtos DLC Secundária atualizadas!");
  };

  const handleConfirmVerification = (verifiedBy: string, observation: string) => {
    const secundariaProductsCount = products.filter(p => p.dlcType === "Secundária").length;
    
    const newLog: VerificationLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      verifiedBy: verifiedBy || undefined,
      observation: observation || undefined,
      productsCount: secundariaProductsCount,
    };

    // Add to beginning of array (most recent first)
    const updatedLogs = [newLog, ...verificationLogs];
    setVerificationLogs(updatedLogs);
    setLastVerification(newLog);

    toast.success("✅ Verificação registrada com sucesso!", {
      description: `${secundariaProductsCount} produtos verificados.`,
    });
  };

  const handleExportVerifications = () => {
    // Generate CSV content
    const headers = ["Data e Hora", "Responsável", "Produtos Verificados", "Observações"];
    const rows = verificationLogs.map(log => [
      new Date(log.date).toLocaleString("pt-BR"),
      log.verifiedBy || "-",
      log.productsCount.toString(),
      log.observation || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    // Create download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `verificacoes_dlc_secundaria_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Histórico exportado com sucesso!");
  };

  const handleResetProducts = () => {
    localStorage.removeItem("products");
    localStorage.removeItem("verificationLogs"); // Também limpa os logs de verificação
    setVerificationLogs([]);
    setLastVerification(null);

    // Recarrega os produtos padrão diretamente
    const allDefaultProducts: DefaultProductItem[] = [
      ...primariaDefaultProducts.map(item => {
        const dlcType: DLCType = "Primária";
        return {
          ...item,
          id: generateStableId(item.category, item.name, dlcType),
          dlcType: dlcType,
        };
      }),
      ...dlcNegativaProteinasDefaultProducts.map(item => {
        const dlcType: DLCType = "Primária";
        return {
          ...item,
          id: generateStableId(item.category, item.name, dlcType),
          dlcType: dlcType,
        };
      }),
      ...secundariaProducts.map(item => {
        const dlcType: DLCType = "Secundária";
        const expiryDate = "2025-12-01T00:00";
        return {
          ...item,
          id: generateStableId(item.category, item.name, dlcType),
          dlcType: dlcType,
          expiryDate: expiryDate,
        };
      }),
      { id: generateStableId("DLC Positiva", "Alface L6", "Primária"), category: "DLC Positiva", subCategory: "Frescos", name: "Alface L6", expiryDate: "2025-12-10T18:00", dlcType: "Primária", observation: "Exemplo com subcategoria" },
      { id: generateStableId("DLC Positiva", "Batata Frita", "Primária"), category: "DLC Positiva", subCategory: "Congelados", name: "Batata Frita", expiryDate: "2025-12-20T00:00", dlcType: "Primária", observation: "Outro exemplo" },
    ];

    const initialProducts = allDefaultProducts.map(item => 
      updateProductCalculations({
        id: item.id,
        category: item.category,
        subCategory: item.subCategory,
        name: item.name,
        expiryDate: item.expiryDate || "2025-12-01T00:00",
        dlcType: item.dlcType || "Primária",
        observation: item.observation,
      })
    );
    setProducts(initialProducts);
    toast.success("Produtos e histórico resetados para os valores padrão!");
  };

  // Check if verified today for badge
  const isVerifiedToday = lastVerification
    ? new Date(lastVerification.date).toDateString() === new Date().toDateString()
    : false;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">📆 Controle DLC - Amdora</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie produtos e monitore prazos de validade</p>
        </div>

        <Tabs defaultValue="primaria" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="primaria">DLC Primária</TabsTrigger>
            <TabsTrigger value="secundaria" className="relative">
              DLC Secundária
              {isVerifiedToday ? (
                <Badge variant="default" className="ml-2 h-5 px-1.5 text-xs bg-success">
                  ✓
                </Badge>
              ) : (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                  !
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Aba DLC Primária */}
          <TabsContent value="primaria" className="space-y-6">
            {/* Badge de Alerta - Produtos Vencendo Hoje */}
            {summaryPrimaria.expiringToday > 0 && (
              <div className="bg-warning/10 border-2 border-warning rounded-lg p-4 flex items-center gap-3 animate-pulse">
                <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-warning text-lg">
                    ⚠️ Atenção: {summaryPrimaria.expiringToday} {summaryPrimaria.expiringToday === 1 ? 'produto vence' : 'produtos vencem'} HOJE!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Verifique os produtos marcados em amarelo na tabela abaixo.
                  </p>
                </div>
                <Badge variant="destructive" className="text-lg px-4 py-2 flex-shrink-0">
                  {summaryPrimaria.expiringToday}
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
              <SummaryCard title="Total de Itens" value={summaryPrimaria.total} icon={Package} />
              <SummaryCard
                title="Vencidos"
                value={summaryPrimaria.expired}
                icon={AlertTriangle}
                colorClass="text-expired"
              />
              <SummaryCard
                title="Vencem Hoje"
                value={summaryPrimaria.expiringToday}
                icon={Calendar}
                colorClass="text-warning"
              />
              <SummaryCard
                title="Dentro do Prazo"
                value={summaryPrimaria.ok}
                icon={CheckCircle}
                colorClass="text-success"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 hidden md:block"> {/* Added hidden md:block */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por produto ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="expired">Vencidos</SelectItem>
                  <SelectItem value="today">Vencem Hoje</SelectItem>
                  <SelectItem value="critical">Alerta Crítico (≤3 dias)</SelectItem>
                  <SelectItem value="warning">Vence em Breve (≤7 dias)</SelectItem>
                  <SelectItem value="ok">OK</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddNew} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
              <Button onClick={handleResetProducts} variant="outline" className="w-full md:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" />
                Resetar Produtos Padrão
              </Button>
            </div>

            <ProductTableByCategory
              products={filteredProducts.filter(p => p.dlcType === "Primária")} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          </TabsContent>

          {/* Aba DLC Secundária */}
          <TabsContent value="secundaria" className="space-y-6">
            {/* Verification Status Card */}
            <VerificationStatusCard
              lastVerificationDate={lastVerification?.date}
              lastVerifiedBy={lastVerification?.verifiedBy}
              productsCount={lastVerification?.productsCount}
            />

            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setVerificationDialogOpen(true)} 
                variant="default"
                size="default"
              >
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Confirmar Verificação Diária
              </Button>
              {/* Botão "Adicionar Produtos do Dia" removido, pois os produtos DLC Secundária são fixos */}
              <Button onClick={handleRenewSecundariaProducts} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Renovar DLC Secundária
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
              <SummaryCard title="Total de Itens" value={summarySecundaria.total} icon={Package} />
              <SummaryCard
                title="Vencidos"
                value={summarySecundaria.expired}
                icon={AlertTriangle}
                colorClass="text-expired"
              />
              <SummaryCard
                title="Vencem Hoje"
                value={summarySecundaria.expiringToday}
                icon={Calendar}
                colorClass="text-warning"
              />
              <SummaryCard
                title="Dentro do Prazo"
                value={summarySecundaria.ok}
                icon={CheckCircle}
                colorClass="text-success"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 hidden md:block"> {/* Added hidden md:block */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por produto ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="expired">Vencidos</SelectItem>
                  <SelectItem value="today">Vencem Hoje</SelectItem>
                  <SelectItem value="critical">Alerta Crítico (≤3 dias)</SelectItem>
                  <SelectItem value="warning">Vence em Breve (≤7 dias)</SelectItem>
                  <SelectItem value="ok">OK</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddNew} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>

            <ProductTableByCategory
              products={filteredProducts.filter(p => p.dlcType === "Secundária")} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />

            {/* Verification History */}
            <VerificationHistoryTable
              logs={verificationLogs}
              onExport={handleExportVerifications}
            />
          </TabsContent>
        </Tabs>

        {/* Product Dialog */}
        <ProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSave}
          product={editingProduct}
        />

        {/* Verification Dialog */}
        <VerificationDialog
          open={verificationDialogOpen}
          onOpenChange={setVerificationDialogOpen}
          onConfirm={handleConfirmVerification}
          productsCount={products.filter(p => p.dlcType === "Secundária").length}
        />
      </div>
    </div>
  );
};

export default Index;