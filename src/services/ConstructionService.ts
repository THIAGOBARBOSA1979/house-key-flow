
export interface ConstructionUpdate {
  id: string;
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

class ConstructionService {
  private updates: ConstructionUpdate[] = [
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

  private storageKey = "a2_construction_updates";

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.updates = parsed.map((u: any) => ({
          ...u,
          date: new Date(u.date)
        }));
      } catch (e) {
        console.error("Failed to load construction updates", e);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.updates));
  }

  getUpdates(): ConstructionUpdate[] {
    return [...this.updates].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getUpdatesByProperty(propertyId: string): ConstructionUpdate[] {
    return this.updates.filter(u => u.isGlobal || u.propertyId === propertyId);
  }

  createUpdate(data: Omit<ConstructionUpdate, 'id'>) {
    const newUpdate = {
      ...data,
      id: crypto.randomUUID(),
      date: data.date || new Date(),
      status: data.status || 'published'
    };
    this.updates.push(newUpdate);
    this.persist();
    return newUpdate;
  }

  updateUpdate(id: string, data: Partial<ConstructionUpdate>) {
    const index = this.updates.findIndex(u => u.id === id);
    if (index !== -1) {
      this.updates[index] = { ...this.updates[index], ...data };
      this.persist();
      return this.updates[index];
    }
    return null;
  }

  deleteUpdate(id: string) {
    this.updates = this.updates.filter(u => u.id !== id);
    this.persist();
  }

  getLatestProgress(propertyId?: string) {
    const source = propertyId ? this.getUpdatesByProperty(propertyId) : this.updates;
    const updateWithProgress = [...source]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .find(u => u.progressItems);
    return updateWithProgress?.progressItems || [];
  }

  markAsRead(updateId: string, userId: string) {
    const update = this.updates.find(u => u.id === updateId);
    if (update) {
      if (!update.readBy) update.readBy = [];
      if (!update.readBy.includes(userId)) {
        update.readBy.push(userId);
        this.persist();
      }
    }
  }
}

export const constructionService = new ConstructionService();
