import { User, UserFormData } from "@/types/user";
import { UserForm } from "./UserForm";
import { FormDialog } from "@/components/shared/FormDialog";

interface UserDialogsProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingUser: User | null;
  onSave: (data: UserFormData) => void;
}

export const UserDialogs = ({ 
  isFormOpen, 
  setIsFormOpen, 
  editingUser, 
  onSave 
}: UserDialogsProps) => {
  return (
    <FormDialog
      isOpen={isFormOpen}
      onClose={() => setIsFormOpen(false)}
      title={editingUser ? "Editar Usuário" : "Novo Usuário"}
      description={editingUser ? "Atualize as permissões e dados cadastrais." : "Configure o perfil e nível de acesso do novo integrante."}
    >
      <UserForm 
        onSave={(data) => {
          onSave(data);
          setIsFormOpen(false);
        }}
        onCancel={() => setIsFormOpen(false)}
        editingUser={editingUser}
      />
    </FormDialog>
  );
};
