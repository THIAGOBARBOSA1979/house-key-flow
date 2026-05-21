
import { useState } from "react";
import { PlusCircle, Trash2, Check, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Type definitions
export type ChecklistItem = {
  id: string;
  name: string;
  completed: boolean;
  status?: "ok" | "issue" | "na";
  observations?: string;
  category: string;
};

export type ChecklistCategory = {
  id: string;
  name: string;
};

interface CustomChecklistProps {
  items: ChecklistItem[];
  readOnly?: boolean;
  onChange?: (items: ChecklistItem[]) => void;
  onAddItem?: (item: Omit<ChecklistItem, "id">) => void;
  onRemoveItem?: (id: string) => void;
}

// Default categories for the checklist
const defaultCategories: ChecklistCategory[] = [
  { id: "estrutura", name: "Estrutura" },
  { id: "hidraulica", name: "Instalações Hidráulicas" },
  { id: "eletrica", name: "Instalações Elétricas" },
  { id: "acabamento", name: "Acabamentos" },
  { id: "esquadrias", name: "Esquadrias e Vidros" },
  { id: "outros", name: "Outros" }
];

export function CustomChecklist({
  items = [],
  readOnly = false,
  onChange,
  onAddItem,
  onRemoveItem
}: CustomChecklistProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState(defaultCategories[0].id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedObservation, setEditedObservation] = useState("");
  
  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || "outros";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);
  
  // Handler for completing an item
  const handleStatusChange = (id: string, status: "ok" | "issue" | "na") => {
    if (readOnly) return;
    
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, status, completed: true };
      }
      return item;
    });
    
    onChange?.(updatedItems);
  };
  
  // Handler for adding a new item to the checklist
  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    onAddItem?.({
      name: newItemName.trim(),
      completed: false,
      category: newItemCategory
    });
    
    setNewItemName("");
  };
  
  // Handler for removing an item from the checklist
  const handleRemoveItem = (id: string) => {
    onRemoveItem?.(id);
  };
  
  // Start editing observations
  const startEditingObservation = (id: string, currentObservation?: string) => {
    setEditingId(id);
    setEditedObservation(currentObservation || "");
  };
  
  // Save edited observation
  const saveObservation = (id: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, observations: editedObservation };
      }
      return item;
    });
    
    onChange?.(updatedItems);
    setEditingId(null);
  };
  
  // Cancel editing observation
  const cancelEditObservation = () => {
    setEditingId(null);
  };
  
  return (
    <div className="space-y-4">
      {/* Add new item form (only shown in edit mode) */}
      {!readOnly && (
        <Card className="border-dashed">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Adicionar novo item ao checklist</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,auto] gap-3">
              <Input
                placeholder="Nome do item"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
              />
              <Select
                value={newItemCategory}
                onValueChange={setNewItemCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {defaultCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddItem} type="button" className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Adicionar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Checklist items grouped by category */}
      <Accordion type="multiple" defaultValue={Object.keys(groupedItems)} className="space-y-2">
        {Object.entries(groupedItems).map(([categoryId, categoryItems]) => {
          const category = defaultCategories.find(c => c.id === categoryId) || { id: categoryId, name: categoryId };
          
          return (
            <AccordionItem key={categoryId} value={categoryId} className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span>{category.name}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {categoryItems.length} {categoryItems.length === 1 ? "item" : "itens"}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="divide-y">
                  {categoryItems.map(item => (
                    <div key={item.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          
                          {/* Observation text or edit form */}
                          {editingId === item.id ? (
                            <div className="mt-2 space-y-2">
                              <Input
                                placeholder="Observações..."
                                value={editedObservation}
                                onChange={e => setEditedObservation(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => saveObservation(item.id)} className="flex items-center gap-1">
                                  <Save className="h-3 w-3" />
                                  <span>Salvar</span>
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEditObservation} className="flex items-center gap-1">
                                  <X className="h-3 w-3" />
                                  <span>Cancelar</span>
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {item.observations && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.observations}
                                </p>
                              )}
                              {!readOnly && !item.observations && (
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs"
                                  onClick={() => startEditingObservation(item.id)}
                                >
                                  Adicionar observação
                                </Button>
                              )}
                              {!readOnly && item.observations && (
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs"
                                  onClick={() => startEditingObservation(item.id, item.observations)}
                                >
                                  Editar observação
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center">
                          {!readOnly ? (
                            <>
                              <div className="flex border rounded-md overflow-hidden">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={cn(
                                    "rounded-none px-3 h-8",
                                    item.status === "ok" && "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
                                  )}
                                  onClick={() => handleStatusChange(item.id, "ok")}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={cn(
                                    "rounded-none px-3 h-8",
                                    item.status === "issue" && "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900"
                                  )}
                                  onClick={() => handleStatusChange(item.id, "issue")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={cn(
                                    "rounded-none px-3 h-8",
                                    item.status === "na" && "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900"
                                  )}
                                  onClick={() => handleStatusChange(item.id, "na")}
                                >
                                  N/A
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-1 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <div className={cn(
                              "px-2 py-1 text-xs font-medium rounded-md",
                              item.status === "ok" && "bg-green-100 text-green-800",
                              item.status === "issue" && "bg-red-100 text-red-800",
                              item.status === "na" && "bg-gray-100 text-gray-800",
                              !item.status && "bg-amber-100 text-amber-800"
                            )}>
                              {item.status === "ok" ? "OK" : 
                               item.status === "issue" ? "Problema" :
                               item.status === "na" ? "N/A" : "Pendente"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      
      {/* Empty state */}
      {Object.keys(groupedItems).length === 0 && (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">
            {readOnly
              ? "Não há itens no checklist"
              : "Adicione itens ao checklist utilizando o formulário acima"}
          </p>
        </div>
      )}
    </div>
  );
}
