
import { useState, useMemo } from "react";
import { WarrantyItem } from "@/types/warranty";
import { warrantyValidationService } from "@/services/WarrantyValidationService";
import { WarrantyItemCard } from "./WarrantyItemCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ShieldCheck, ShieldX, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface WarrantyItemSelectorProps {
  clientId: string;
  selectedItemId: string | null;
  onSelectItem: (item: WarrantyItem | null) => void;
  showIneligible?: boolean;
}

export function WarrantyItemSelector({
  clientId,
  selectedItemId,
  onSelectItem,
  showIneligible = true,
}: WarrantyItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading] = useState(false);
  
  // Get all warranty items for the client
  const allItems = useMemo(() => {
    return warrantyValidationService.getWarrantyItemsByClient(clientId);
  }, [clientId]);
  
  // Separate eligible and ineligible items
  const { eligibleItems, ineligibleItems } = useMemo(() => {
    const eligible: WarrantyItem[] = [];
    const ineligible: WarrantyItem[] = [];
    
    allItems.forEach(item => {
      const eligibility = warrantyValidationService.getEligibility(item, clientId);
      if (eligibility.isEligible) {
        eligible.push(item);
      } else {
        ineligible.push(item);
      }
    });
    
    return { eligibleItems: eligible, ineligibleItems: ineligible };
  }, [allItems, clientId]);
  
  // Filter items by search query
  const filteredEligible = useMemo(() => {
    if (!searchQuery) return eligibleItems;
    const query = searchQuery.toLowerCase();
    return eligibleItems.filter(
      item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [eligibleItems, searchQuery]);
  
  const filteredIneligible = useMemo(() => {
    if (!searchQuery) return ineligibleItems;
    const query = searchQuery.toLowerCase();
    return ineligibleItems.filter(
      item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [ineligibleItems, searchQuery]);
  
  // Handle item selection
  const handleSelect = (item: WarrantyItem) => {
    if (selectedItemId === item.id) {
      onSelectItem(null);
    } else {
      onSelectItem(item);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  // No items at all
  if (allItems.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Nenhum item encontrado</AlertTitle>
        <AlertDescription>
          Você não possui itens de garantia cadastrados no momento.
        </AlertDescription>
      </Alert>
    );
  }
  
  // No eligible items
  if (eligibleItems.length === 0) {
    return (
      <Alert variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertTitle>Nenhum item elegível</AlertTitle>
        <AlertDescription>
          Você não possui itens com garantia ativa no momento. Apenas itens com garantia ativa podem gerar novas solicitações.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar item de garantia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {showIneligible && ineligibleItems.length > 0 ? (
        <Tabs defaultValue="eligible" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="eligible" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              Elegíveis ({filteredEligible.length})
            </TabsTrigger>
            <TabsTrigger value="ineligible" className="gap-2">
              <ShieldX className="h-4 w-4" />
              Expirados ({filteredIneligible.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="eligible" className="mt-4">
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-3">
                {filteredEligible.length > 0 ? (
                  filteredEligible.map(item => {
                    const eligibility = warrantyValidationService.getEligibility(item, clientId);
                    return (
                      <WarrantyItemCard
                        key={item.id}
                        item={item}
                        eligibility={eligibility}
                        isSelected={selectedItemId === item.id}
                        onSelect={() => handleSelect(item)}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum item encontrado com a busca "{searchQuery}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="ineligible" className="mt-4">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Itens abaixo não podem gerar novas solicitações pois a garantia está expirada ou cancelada.
              </AlertDescription>
            </Alert>
            <ScrollArea className="h-[260px] pr-4">
              <div className="space-y-3">
                {filteredIneligible.length > 0 ? (
                  filteredIneligible.map(item => {
                    const eligibility = warrantyValidationService.getEligibility(item, clientId);
                    return (
                      <WarrantyItemCard
                        key={item.id}
                        item={item}
                        eligibility={eligibility}
                        disabled
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum item encontrado com a busca "{searchQuery}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      ) : (
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-3">
            {filteredEligible.map(item => {
              const eligibility = warrantyValidationService.getEligibility(item, clientId);
              return (
                <WarrantyItemCard
                  key={item.id}
                  item={item}
                  eligibility={eligibility}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleSelect(item)}
                />
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
