import { User } from "@/types/user";

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'admin@exemplo.com',
    role: 'admin',
    status: 'active',
    is_super_admin: true,
    createdAt: new Date(2023, 0, 1)
  },
  {
    id: 'ceo-1',
    name: 'João CEO',
    email: 'ceo@a2.com',
    role: 'admin',
    status: 'active',
    company_id: 'comp-1',
    createdAt: new Date(2023, 5, 15)
  },
  {
    id: 'client-2',
    name: 'Maria Silva',
    email: 'cliente@exemplo.com',
    role: 'client',
    status: 'active',
    company_id: 'comp-1',
    createdAt: new Date(2024, 0, 10)
  }
];

export const findMockUser = (email: string, role: string) => {
  return MOCK_USERS.find(u => u.email === email && (role === 'admin' ? (u.role === 'admin' || u.role === 'manager') : u.role === 'client'));
};
