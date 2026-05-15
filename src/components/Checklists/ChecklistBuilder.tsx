
import { useState } from "react";
import { cn } from "@/lib/utils";

// uuid will be generated with Date.now() for demo purposes
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ChecklistItem } from "@/services/ChecklistService";
import { Plus, Trash, Check } from "lucide-react";

interface ChecklistBuilderProps {
  onSave: (title: string, description: string, items: ChecklistItem[]) => void;
  onCancel: () => void;
}

// Default categories for organizing items
const itemCategories = [
  "Estrutural",
  "Hidráulica",
  "Elétrica",
  "Acabamento",
  "Esquadrias",
  "Outros"
];

const severities = [
  { value: "low", label: "Baixa", color: "bg-blue-100 text-blue-800" },
  { value: "medium", label: "Média", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "Alta", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Crítica", color: "bg-red-100 text-red-800" },
];

export const ChecklistBuilder = ({ onSave, onCancel }: ChecklistBuilderProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  
  // New item form state
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemCategory, setNewItemCategory] = useState(itemCategories[0]);
  const [newItemRequired, setNewItemRequired] = useState(true);
  const [newItemSeverity, setNewItemSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  
  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    let category = "Outros";
    const match = item.description.match(/^([^:]+):\s(.+)$/);
    
    if (match && itemCategories.includes(match[1])) {
      category = match[1];
    }
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);
  
  const handleAddItem = () => {
    if (!newItemDescription.trim()) return;
    
    const formattedDescription = newItemCategory 
      ? `${newItemCategory}: ${newItemDescription}` 
      : newItemDescription;
      
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      description: formattedDescription,
      required: newItemRequired,
      severity: newItemSeverity,
      evidence: []
    };
    
    setItems([...items, newItem]);
    setNewItemDescription("");
  };

  
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title, description, items);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Checklist</CardTitle>
          <CardDescription>
            Defina o título e a descrição do seu novo checklist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Checklist</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Vistoria de Pré-Entrega"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito deste checklist..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Item addition form */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Checklist</CardTitle>
          <CardDescription>
            Adicione os itens que devem ser verificados neste checklist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
              <Input
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Descrição do item"
              />
              
              <Select
                value={newItemCategory}
                onValueChange={setNewItemCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {itemCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newItemSeverity}
                onValueChange={(val: any) => setNewItemSeverity(val)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  {severities.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleAddItem} disabled={!newItemDescription.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="required" 
                checked={newItemRequired} 
                onCheckedChange={(checked) => setNewItemRequired(checked === true)}
              />
              <Label htmlFor="required">Item obrigatório para conformidade total</Label>
            </div>
          </div>

          {/* Display added items grouped by category */}
          <div className="mt-6 space-y-4">
            {Object.keys(groupedItems).length > 0 ? (
              Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium">{category}</h3>
                  <div className="border rounded-md divide-y">
                    {categoryItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          {item.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Obrigatório
                            </span>
                          )}
                          <span>{item.description.split(': ')[1] || item.description}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum item adicionado ao checklist
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-border/10">
        <Button variant="outline" onClick={onCancel} className="rounded-lg font-bold">Cancelar</Button>
        <Button onClick={handleSave} disabled={!title.trim() || items.length === 0} className="rounded-lg font-bold bg-primary hover:bg-primary/90">
          <Check className="mr-2 h-4 w-4" />
          Salvar Checklist
        </Button>
      </div>
    </div>
  );
};
