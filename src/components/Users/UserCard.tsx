import { Mail, Phone, MoreVertical, Eye, Edit, Share2, UserMinus, UserCheck, Trash2, User as UserIcon, UserCog } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "@/services/UserService";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: (userId: string) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string) => void;
  onResendInvite: (user: User) => void;
  onViewProfile: (user: User) => void;
}

const roleConfig = {
  admin: { label: "Administrador", badge: "bg-purple-100 text-purple-800 border-purple-200", icon: UserCog },
  manager: { label: "Gerente", badge: "bg-blue-100 text-blue-800 border-blue-200", icon: UserCheck },
  technical: { label: "Técnico", badge: "bg-green-100 text-green-800 border-green-200", icon: UserCheck },
  client: { label: "Cliente", badge: "bg-gray-100 text-gray-800 border-gray-200", icon: UserIcon },
};

export const UserCard = ({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  onResendInvite,
  onViewProfile
}: UserCardProps) => {
  return (
    <Card 
      className={cn(
        "card-standard overflow-hidden card-hover-effect border-none bg-card/50 backdrop-blur-sm group",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Checkbox checked={isSelected} onCheckedChange={() => onSelect(user.id!)} className="rounded-md" />
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-lg border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
              {user.avatar}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">{user.name}</h3>
              <p className="text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter">Login: {user.lastLogin || '-'}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-sem-lg animate-in fade-in zoom-in-95 duration-200 p-2 rounded-2xl border-none">
              <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => onViewProfile(user)}>
                <Eye className="mr-3 h-4 w-4 text-muted-foreground" />Ver Perfil Completo
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => onEdit(user)}>
                <Edit className="mr-3 h-4 w-4 text-muted-foreground" />Editar Dados
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => onResendInvite(user)}>
                <Share2 className="mr-3 h-4 w-4 text-muted-foreground" /> Reenviar Convite
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => onToggleStatus(user.id!)}>
                {user.status === "active" ? <UserMinus className="mr-3 h-4 w-4 text-muted-foreground" /> : <UserCheck className="mr-3 h-4 w-4 text-muted-foreground" />}
                {user.status === "active" ? "Desativar Acesso" : "Ativar Acesso"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem onClick={() => onDelete(user.id!)} className="py-3 px-4 font-black text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer rounded-xl">
                <Trash2 className="mr-3 h-4 w-4 opacity-50" />Remover Permanentemente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2.5 text-sem-body-sm text-muted-foreground">
            <div className="p-1 bg-muted rounded-md"><Mail size={12} /></div>
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sem-body-sm text-muted-foreground">
            <div className="p-1 bg-muted rounded-md"><Phone size={12} /></div>
            <span>{user.phone}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border/10">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("text-sem-tiny font-bold rounded-lg", roleConfig[user.role as keyof typeof roleConfig]?.badge)}>
              {roleConfig[user.role as keyof typeof roleConfig]?.label}
            </Badge>
            {user.status === "inactive" && (
              <Badge variant="outline" className="text-sem-tiny font-bold bg-status-critical/10 text-status-critical border-status-critical/20 rounded-lg">
                Inativo
              </Badge>
            )}
          </div>
          {user.role === "client" && user.propertyName && (
            <div className="text-right">
              <p className="text-sem-tiny font-bold uppercase tracking-tighter text-primary">{user.propertyName}</p>
              <p className="text-sem-tiny text-muted-foreground font-medium">Unidade {user.unit}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
