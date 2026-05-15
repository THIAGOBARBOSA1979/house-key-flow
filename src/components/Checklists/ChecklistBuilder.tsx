
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
import { ChecklistItem, ChecklistGroup } from "@/services/ChecklistService";
import { Plus, Trash, Check, GripVertical, FolderPlus, MoreVertical, Copy } from "lucide-react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ChecklistBuilderProps {
  onSave: (title: string, description: string, groups: ChecklistGroup[]) => void;
  onCancel: () => void;
}

// Sub-component for sortable item
const SortableItem = ({ item, onRemove }: { item: ChecklistItem, onRemove: (id: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const severityInfo = severities.find(s => s.value === item.severity);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "flex items-center justify-between p-3 bg-white border rounded-lg group shadow-sm",
        isDragging && "ring-2 ring-primary ring-inset"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {item.required && (
              <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Obrigatório
              </span>
            )}
            {item.severity && (
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                severityInfo?.color
              )}>
                {severityInfo?.label}
              </span>
            )}
            <span className="font-medium text-sm">{item.description}</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};

// Sub-component for sortable group
const SortableGroup = ({ 
  group, 
  onRemove, 
  onAddItem,
  onRemoveItem,
  onUpdateGroupName 
}: { 
  group: ChecklistGroup, 
  onRemove: (id: string) => void,
  onAddItem: (groupId: string) => void,
  onRemoveItem: (groupId: string, itemId: string) => void,
  onUpdateGroupName: (id: string, name: string) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : 'auto',
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "border-2 transition-all",
        isDragging ? "border-primary shadow-xl scale-[1.01]" : "border-border/40"
      )}
    >
      <CardHeader className="p-4 bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <Input 
            value={group.name} 
            onChange={(e) => onUpdateGroupName(group.id, e.target.value)}
            className="h-8 font-bold text-base bg-transparent border-none focus-visible:ring-1 max-w-[300px]"
            placeholder="Nome da Seção..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onAddItem(group.id)}>
            <Plus className="h-4 w-4 mr-1" /> Item
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive" onClick={() => onRemove(group.id)}>
                <Trash className="h-4 w-4 mr-2" /> Excluir Seção
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        <SortableContext items={group.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {group.items.length > 0 ? (
            group.items.map(item => (
              <SortableItem key={item.id} item={item} onRemove={(itemId) => onRemoveItem(group.id, itemId)} />
            ))
          ) : (
            <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
              Esta seção está vazia. Adicione itens para começar.
            </div>
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
};

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
  const [groups, setGroups] = useState<ChecklistGroup[]>([
    { id: 'group-1', name: 'Seção Inicial', items: [] }
  ]);
  
  // Modal state for adding item
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemRequired, setNewItemRequired] = useState(true);
  const [newItemSeverity, setNewItemSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddGroup = () => {
    const newGroup: ChecklistGroup = {
      id: `group-${Date.now()}`,
      name: `Nova Seção ${groups.length + 1}`,
      items: []
    };
    setGroups([...groups, newGroup]);
  };

  const handleRemoveGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const handleUpdateGroupName = (id: string, name: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, name } : g));
  };

  const handleOpenAddItem = (groupId: string) => {
    setActiveGroupId(groupId);
    setIsAddItemOpen(true);
  };

  const handleAddItem = () => {
    if (!newItemDescription.trim() || !activeGroupId) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      description: newItemDescription,
      required: newItemRequired,
      severity: newItemSeverity,
      evidence: []
    };

    setGroups(groups.map(g => 
      g.id === activeGroupId 
        ? { ...g, items: [...g.items, newItem] } 
        : g
    ));

    setNewItemDescription("");
    setIsAddItemOpen(false);
    setActiveGroupId(null);
  };

  const handleRemoveItem = (groupId: string, itemId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId 
        ? { ...g, items: g.items.filter(i => i.id !== itemId) } 
        : g
    ));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      // Logic for moving groups or items
      const activeId = active.id.toString();
      const overId = over.id.toString();

      // Is it a group?
      if (activeId.startsWith('group-') && overId.startsWith('group-')) {
        setGroups((items) => {
          const oldIndex = items.findIndex((i) => i.id === activeId);
          const newIndex = items.findIndex((i) => i.id === overId);
          return arrayMove(items, oldIndex, newIndex);
        });
      } else {
        // Item drag (simplified: only within same group for now or implement cross-group)
        // Find which groups these IDs belong to
        const activeGroup = groups.find(g => g.items.some(i => i.id === activeId));
        const overGroup = groups.find(g => g.items.some(i => i.id === overId));

        if (activeGroup && overGroup && activeGroup.id === overGroup.id) {
          const updatedGroups = groups.map(g => {
            if (g.id === activeGroup.id) {
              const oldIndex = g.items.findIndex((i) => i.id === activeId);
              const newIndex = g.items.findIndex((i) => i.id === overId);
              return { ...g, items: arrayMove(g.items, oldIndex, newIndex) };
            }
            return g;
          });
          setGroups(updatedGroups);
        }
      }
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title, description, groups);
  };
  
  return (
    <div className="space-y-6 pb-20">
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-black tracking-tight">Criação de Template</CardTitle>
              <CardDescription>Defina a estrutura técnica do checklist</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} className="rounded-xl font-bold">Cancelar</Button>
              <Button onClick={handleSave} disabled={!title.trim() || groups.every(g => g.items.length === 0)} className="rounded-xl font-bold bg-primary hover:bg-primary/90">
                <Check className="mr-2 h-4 w-4" /> Salvar Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold text-xs uppercase text-muted-foreground">Título do Checklist</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Vistoria de Entrega - Fase A"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold text-xs uppercase text-muted-foreground">Descrição / Objetivo</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Finalidade técnica deste modelo..."
                className="rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Estrutura de Verificação 
            <Badge variant="outline" className="font-black">{groups.length} SEÇÕES</Badge>
          </h3>
          <Button size="sm" onClick={handleAddGroup} className="rounded-xl font-bold gap-2">
            <FolderPlus className="h-4 w-4" /> Adicionar Seção
          </Button>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            <SortableContext items={groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
              {groups.map((group) => (
                <SortableGroup 
                  key={group.id} 
                  group={group} 
                  onRemove={handleRemoveGroup}
                  onAddItem={handleOpenAddItem}
                  onRemoveItem={handleRemoveItem}
                  onUpdateGroupName={handleUpdateGroupName}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </div>

      {/* Modal fake de adição de item (poderia usar um Dialog do shadcn) */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Novo Item de Verificação</CardTitle>
              <CardDescription>Adicione uma pergunta ou ponto de inspeção</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição do Item</Label>
                <Textarea 
                  value={newItemDescription} 
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="O que deve ser verificado?"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severidade</Label>
                  <Select value={newItemSeverity} onValueChange={(val: any) => setNewItemSeverity(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severities.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col justify-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="req-new" 
                      checked={newItemRequired} 
                      onCheckedChange={(val) => setNewItemRequired(val === true)} 
                    />
                    <Label htmlFor="req-new" className="text-sm font-bold">Obrigatório</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button variant="ghost" onClick={() => setIsAddItemOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddItem} disabled={!newItemDescription.trim()}>Adicionar</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};
};
