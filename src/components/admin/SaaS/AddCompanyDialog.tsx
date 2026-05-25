import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubscriptionPlan } from "@/services";
import { Plus } from "lucide-react";

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCompany: { name: string; slug: string; plan: SubscriptionPlan };
  setNewCompany: (data: any) => void;
  slugError: string | null;
  isSaving: boolean;
  onAdd: () => void;
}

export const AddCompanyDialog: React.FC<AddCompanyDialogProps> = ({
  open,
  onOpenChange,
  newCompany,
  setNewCompany,
  slugError,
  isSaving,
  onAdd
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">Cadastrar Novo Tenant</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Empresa</Label>
            <Input 
              placeholder="Ex: Minha Incorporadora" 
              value={newCompany.name} 
              onChange={e => setNewCompany({...newCompany, name: e.target.value})}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slug do Subdomínio</Label>
            <Input 
              placeholder="ex: minha-incorporadora" 
              value={newCompany.slug} 
              onChange={e => setNewCompany({...newCompany, slug: e.target.value})}
              className={`h-11 rounded-xl ${slugError ? 'border-red-500' : ''}`}
            />
            {slugError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{slugError}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plano Inicial</Label>
            <Select 
              value={newCompany.plan} 
              onValueChange={v => setNewCompany({...newCompany, plan: v as SubscriptionPlan})}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial (Grátis 14 dias)</SelectItem>
                <SelectItem value="essencial">Essencial</SelectItem>
                <SelectItem value="profissional">Profissional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>

              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-11 px-6 font-bold">Cancelar</Button>
          <Button onClick={onAdd} disabled={isSaving} className="rounded-xl h-11 px-8 font-black uppercase tracking-widest text-xs gap-2">
            <Plus className="w-4 h-4" /> 
            {isSaving ? "Criando..." : "Criar Tenant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
