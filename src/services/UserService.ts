
import { z } from "zod";
import { auditLogService } from "./AuditLogService";

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  role: z.enum(["admin", "manager", "technical", "client"]),
  status: z.enum(["active", "inactive"]).default("active"),
  propertyId: z.string().optional().nullable(),
  propertyName: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  lastLogin: z.string().optional(),
  avatar: z.string().optional(),
  notes: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

class UserService {
  private users: User[] = [
    { id: "1", name: "João Silva", email: "joao.silva@email.com", phone: "(11) 99999-8888", role: "admin", status: "active", propertyName: "Edifício Aurora", propertyId: "1", unit: "507", lastLogin: "2024-01-15", avatar: "JS" },
    { id: "2", name: "Maria Oliveira", email: "maria.oliveira@email.com", phone: "(11) 97777-6666", role: "client", status: "active", propertyName: "Edifício Aurora", propertyId: "1", unit: "204", lastLogin: "2024-01-14", avatar: "MO" },
    { id: "3", name: "Roberto Pereira", email: "roberto.pereira@email.com", phone: "(11) 95555-4444", role: "client", status: "active", propertyName: "Residencial Bosque Verde", propertyId: "2", unit: "102", lastLogin: "2024-01-13", avatar: "RP" },
    { id: "4", name: "Juliana Costa", email: "juliana.costa@email.com", phone: "(11) 93333-2222", role: "technical", status: "active", propertyId: null, unit: null, lastLogin: "2024-01-15", avatar: "JC" },
    { id: "5", name: "Fernando Martins", email: "fernando.martins@email.com", phone: "(11) 91111-0000", role: "client", status: "inactive", propertyName: "Residencial Bosque Verde", propertyId: "2", unit: "405", lastLogin: "2024-01-10", avatar: "FM" },
    { id: "6", name: "Luciana Santos", email: "luciana.santos@email.com", phone: "(11) 98888-7777", role: "manager", status: "active", propertyId: null, unit: null, lastLogin: "2024-01-15", avatar: "LS" },
  ];

  private storageKey = "a2_users";

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.users = parsed;
        }
      } catch (e) {
        // Silently fail or log in development, but ensure stability
        localStorage.removeItem(this.storageKey);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.users));
  }

  getAll(): User[] {
    return [...this.users];
  }

  getById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  create(user: Omit<User, "id">): User {
    const newUser = {
      ...user,
      id: crypto.randomUUID(),
      avatar: user.name.split(" ").map(n => n[0]).join("").toUpperCase().substr(0, 2),
      lastLogin: "-",
    };
    this.users.push(newUser);
    this.persist();
    auditLogService.log({
      entityType: 'user',
      entityId: newUser.id,
      action: 'created',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Usuário ${newUser.name} criado com nível ${newUser.role}.`
    });
    return newUser;
  }

  update(id: string, userData: Partial<User>): User | undefined {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    this.users[index] = { ...this.users[index], ...userData };
    this.persist();
    return this.users[index];
  }

  delete(id: string): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    if (this.users.length !== initialLength) {
      this.persist();
      return true;
    }
    return false;
  }
}

export const userService = new UserService();
