

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { propertyService } from "@/services/PropertyService";

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  editingUser?: any;
}

export const UserForm = ({ isOpen, onClose, onSave, editingUser }: UserFormProps) => {
  const { toast } = useToast();
  const properties = propertyService.getAll();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "client",
    propertyId: "",
    propertyName: "",
    unit: "",
    notes: "",
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        role: editingUser.role || "client",
        propertyId: editingUser.propertyId || "",
        propertyName: editingUser.propertyName || "",
        unit: editingUser.unit || "",
        notes: editingUser.notes || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "client",
        propertyId: "",
        propertyName: "",
        unit: "",
        notes: "",
      });
    }
  }, [editingUser, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
  };

  const handleChange = (field: string, value: string) => {
    if (field === "propertyId") {
      const selectedProp = properties.find(p => p.id === value);
      setFormData(prev => ({ 
        ...prev, 
        propertyId: value, 
        propertyName: selectedProp ? selectedProp.name : "" 
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
          <DialogTitle className="text-2xl font-black tracking-tight">{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription className="text-sm font-medium">
            {editingUser ? "Atualize as permissões e dados cadastrais." : "Configure o perfil e nível de acesso do novo integrante."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome completo <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex: João Silva"
                className="h-11 rounded-xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email institucional <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@exemplo.com"
                className="h-11 rounded-xl"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Telefone / WhatsApp</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                className="h-11 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nível de Acesso</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecione o acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente de Obras</SelectItem>
                  <SelectItem value="technical">Técnico de Vistoria</SelectItem>
                  <SelectItem value="client">Cliente / Proprietário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {formData.role === "client" && (
            <div className="grid grid-cols-2 gap-4 border-t border-dashed pt-6">
              <div className="space-y-2">
                <Label htmlFor="propertyId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vincular Empreendimento</Label>
                <Select value={formData.propertyId} onValueChange={(value) => handleChange("propertyId", value)}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id!}>{prop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unidade / Apartamento</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  placeholder="Ex: 102 Bloco B"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Observações Administrativas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Notas internas sobre o usuário..."
              className="min-h-[100px] rounded-xl resize-none"
              rows={3}
            />
          </div>
        </form>
        
        <DialogFooter className="p-8 border-t border-border/10 bg-muted/5">
          <Button type="button" variant="outline" onClick={onClose} className="h-12 px-8 rounded-xl font-bold transition-all">
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} className="h-12 px-10 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-sem-md active:scale-95 transition-all">
            {editingUser ? "Salvar Alterações" : "Criar Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

