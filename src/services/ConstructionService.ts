import { BaseService } from "./BaseService";

export interface ConstructionUpdate {
  id: string;
  company_id?: string;
  date: Date;
  title: string;
  description: string;
  type: 'milestone' | 'photo' | 'document' | 'video' | 'news';
  imageUrl?: string;
  progressItems?: { label: string; percentage: number }[];
  isGlobal?: boolean;
  propertyId?: string;
  status: 'published' | 'draft' | 'scheduled';
  readBy?: string[]; // user IDs
}

const INITIAL_UPDATES: ConstructionUpdate[] = [
  {
    id: 'news-1',
    date: new Date(),
    title: 'Novo Plantão de Vendas Disponível',
    description: 'Convidamos todos os futuros moradores para conhecerem nosso novo espaço decorado e tirar dúvidas sobre personalização.',
    type: 'news',
    isGlobal: true,
    status: 'published'
  },
  {
    id: '2',
    date: new Date(2024, 1, 15),
    title: 'Conclusão da Alvenaria',
    description: 'Todas as paredes internas e externas foram finalizadas com sucesso.',
    type: 'milestone',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&w=800&q=80',
    progressItems: [
      { label: 'Estrutura', percentage: 100 },
      { label: 'Alvenaria', percentage: 100 },
      { label: 'Instalações', percentage: 70 },
      { label: 'Acabamento', percentage: 0 }
    ],
    status: 'published'
  },
  {
    id: '3',
    date: new Date(2024, 0, 5),
    title: 'Fotos da Fachada',
    description: 'Confira a evolução da pintura externa e colocação de vidros.',
    type: 'photo',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    status: 'published'
  }
];

class ConstructionService extends BaseService<ConstructionUpdate> {
  constructor() {
    super("a2_construction_updates", INITIAL_UPDATES);
  }

  getUpdates(companyId?: string, isSuperAdmin?: boolean): ConstructionUpdate[] {
    return [...this.getAll(companyId, isSuperAdmin)].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getUpdatesByProperty(propertyId: string, companyId?: string, isSuperAdmin?: boolean): ConstructionUpdate[] {
    return this.getAll(companyId, isSuperAdmin).filter(u => u.isGlobal || u.propertyId === propertyId);
  }

  createUpdate(data: Omit<ConstructionUpdate, 'id'>, companyId?: string) {
    return this.create({
      ...data,
      date: data.date || new Date(),
      status: data.status || 'published'
    }, companyId);
  }

  updateUpdate(id: string, data: Partial<ConstructionUpdate>) {
    return this.update(id, data);
  }

  deleteUpdate(id: string) {
    return this.delete(id);
  }

  getLatestProgress(propertyId?: string, companyId?: string, isSuperAdmin?: boolean) {
    const source = propertyId ? this.getUpdatesByProperty(propertyId, companyId, isSuperAdmin) : this.getUpdates(companyId, isSuperAdmin);
    const updateWithProgress = [...source]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .find(u => u.progressItems);
    return updateWithProgress?.progressItems || [];
  }

  markAsRead(updateId: string, userId: string) {
    const update = this.getById(updateId);
    if (update) {
      const readBy = update.readBy || [];
      if (!readBy.includes(userId)) {
        this.update(updateId, { readBy: [...readBy, userId] });
      }
    }
  }
}

export const constructionService = new ConstructionService();
