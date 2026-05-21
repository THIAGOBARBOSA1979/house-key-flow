import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Edit2, 
  Save, 
  Building, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  Activity, 
  XCircle, 
  CheckCircle, 
  Trash2, 
  Users as UsersIcon 
} from "lucide-react";
import { Company, CompanySettings, SubscriptionPlan } from "@/services";
import { User } from "@/types/user";

interface CompanyDetailsDialogProps {
  selectedCompany: Company | null;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  editData: Partial<Company>;
  setEditData: (data: any) => void;
  slugError: string | null;
  isSaving: boolean;
  onSave: (data: Partial<Company>) => void;
  onStartEditing: () => void;
  isUpdatingSub: boolean;
  setIsUpdatingSub: (val: boolean) => void;
  expiryDate: string;
  setExpiryDate: (val: string) => void;
  onUpdateSub: (plan: SubscriptionPlan, expiresAt: string) => void;
  onToggleStatus: (id: string, status: any) => void;
  onDelete: (id: string) => void;
  companyUsers: User[];
  onResetPassword: (name: string) => void;
  counts: {
    users: number;
    properties: number;
    inspections: number;
  };
}

export const CompanyDetailsDialog: React.FC<CompanyDetailsDialogProps> = ({
  selectedCompany,
  onOpenChange,
  isEditing,
  setIsEditing,
  editData,
  setEditData,
  slugError,
  isSaving,
  onSave,
  onStartEditing,
  isUpdatingSub,
  setIsUpdatingSub,
  expiryDate,
  setExpiryDate,
  onUpdateSub,
  onToggleStatus,
  onDelete,
  companyUsers,
  onResetPassword,
  counts
}) => {
  if (!selectedCompany) return null;

  return (
    <Dialog open={!!selectedCompany} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pr-8">
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">
            {isEditing ? "Editando Tenant" : `Gestão de Tenant: ${selectedCompany?.name}`}
          </DialogTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={onStartEditing} className="gap-2 rounded-xl">
              <Edit2 className="w-4 h-4" /> Editar Info
            </Button>
          )}
        </DialogHeader>

        {isEditing ? (
          <div className="py-4 space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Empresa</Label>
                <Input 
                  value={editData.name || ''} 
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slug (ID Único)</Label>
                <Input 
                  value={editData.slug || ''} 
                  onChange={e => setEditData({...editData, slug: e.target.value})}
                  className={`h-11 rounded-xl ${slugError ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]' : ''}`}
                />
                {slugError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{slugError}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plano de Assinatura</Label>
                <Select 
                  value={editData.subscription_plan} 
                  onValueChange={v => setEditData({...editData, subscription_plan: v as SubscriptionPlan})}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E-mail de Suporte</Label>
                <Input 
                  value={editData.settings?.support_email || ''} 
                  onChange={e => setEditData({
                    ...editData, 
                    settings: { ...editData.settings, support_email: e.target.value }
                  })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl h-11 px-6 font-bold">Cancelar</Button>
              <Button onClick={() => onSave(editData)} disabled={isSaving} className="rounded-xl h-11 px-8 font-black uppercase tracking-widest text-xs gap-2">
                <Save className="w-4 h-4" /> 
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="w-3 h-3" /> Slug
                </p>
                <p className="font-bold truncate">{selectedCompany?.slug}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Plano
                </p>
                <Badge variant="outline" className="font-black uppercase text-[10px]">
                  {selectedCompany?.subscription_plan}
                </Badge>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Status
                </p>
                <Badge className={selectedCompany?.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                  {selectedCompany?.status.toUpperCase()}
                </Badge>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Expira em
                </p>
                <p className="font-bold text-xs">
                  {selectedCompany?.subscription_expires_at ? new Date(selectedCompany.subscription_expires_at).toLocaleDateString() : 'Vitalício'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Indicadores
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Card className="p-4 flex items-center justify-between border-none bg-muted/20">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Usuários</span>
                      <span className="text-xl font-black">{counts.users}</span>
                    </Card>
                    <Card className="p-4 flex items-center justify-between border-none bg-muted/20">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Obras</span>
                      <span className="text-xl font-black">{counts.properties}</span>
                    </Card>
                    <Card className="p-4 flex items-center justify-between border-none bg-muted/20">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Vistorias</span>
                      <span className="text-xl font-black">{counts.inspections}</span>
                    </Card>
                  </div>
                </div>

                <div className="p-5 border-2 border-dashed rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ações de Governança</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start font-bold h-10 rounded-xl"
                      onClick={() => onToggleStatus(selectedCompany.id, selectedCompany.status)}
                    >
                      {selectedCompany?.status === 'active' ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      {selectedCompany?.status === 'active' ? "Suspender Acesso" : "Ativar Empresa"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start font-bold h-10 rounded-xl"
                      onClick={() => setIsUpdatingSub(true)}
                    >
                      <Calendar className="w-4 h-4 mr-2" /> Alterar Expiração
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start font-bold h-10 rounded-xl text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(selectedCompany.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir Permanentemente
                    </Button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" /> Usuários Ativos
                  </h4>
                  <Badge variant="secondary" className="rounded-full">{companyUsers.length}</Badge>
                </div>
                
                <div className="border rounded-2xl overflow-hidden bg-card">
                  <div className="max-h-[300px] overflow-y-auto">
                    {companyUsers.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-[10px] uppercase font-black sticky top-0 z-10">
                          <tr>
                            <th className="text-left p-4">Colaborador</th>
                            <th className="text-left p-4">Papel</th>
                            <th className="text-right p-4">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {companyUsers.map(u => (
                            <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="font-bold">{u.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{u.email}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className="uppercase text-[9px] font-black border-primary/20 text-primary">
                                  {u.role}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm" className="text-[10px] h-8 font-black uppercase tracking-widest" onClick={() => onResetPassword(u.name)}>
                                  Resetar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center space-y-2">
                        <UsersIcon className="w-8 h-8 mx-auto text-muted-foreground/20" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nenhum usuário localizado</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isUpdatingSub && (
              <div className="p-6 border-2 border-primary bg-primary/5 rounded-2xl space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary">Ajuste de Validade Estratégica</h4>
                  <Button variant="ghost" size="sm" onClick={() => setIsUpdatingSub(false)}>Cancelar</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Nova Data de Expiração</Label>
                    <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <Button className="h-11 rounded-xl font-black uppercase tracking-widest text-xs" onClick={() => onUpdateSub(selectedCompany.subscription_plan, expiryDate)}>
                    Confirmar Nova Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
