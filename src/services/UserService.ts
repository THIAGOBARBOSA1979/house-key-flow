import { BaseService } from "./BaseService";
import { User } from "@/types/user";

const INITIAL_USERS: User[] = [
  { id: "1", name: "João Silva", email: "joao@exemplo.com", role: "admin", status: "active", createdAt: new Date(2023, 10, 5) },
  { id: "2", name: "Maria Oliveira", email: "maria@exemplo.com", role: "manager", status: "active", createdAt: new Date(2023, 11, 10) },
  { id: "3", name: "Pedro Santos", email: "pedro@exemplo.com", role: "client", status: "active", propertyName: "Edifício Aurora", unit: "101", createdAt: new Date(2024, 0, 15) },
  { id: "4", name: "Ana Costa", email: "ana@exemplo.com", role: "staff", status: "inactive", createdAt: new Date(2024, 1, 20) },
];

class UserService extends BaseService<User> {
  constructor() {
    super("a2_users", INITIAL_USERS);
  }

  getStats() {
    return {
      total: this.items.length,
      active: this.items.filter(u => u.status === "active").length,
      inactive: this.items.filter(u => u.status === "inactive").length,
      clients: this.items.filter(u => u.role === "client").length,
      staff: this.items.filter(u => u.role !== "client").length,
    };
  }
}

export const userService = new UserService();
