import { User, UserFormData } from "@/types/user";
import { UserForm } from "./UserForm";

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
    <>
      {isFormOpen && (
        <UserForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSave={(data) => {
            onSave(data);
            setIsFormOpen(false);
          }}
          editingUser={editingUser}
        />
      )}
    </>
  );
};
