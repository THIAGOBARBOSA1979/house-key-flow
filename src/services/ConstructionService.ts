

export interface ConstructionUpdate {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'milestone' | 'photo' | 'document' | 'video' | 'news';
  imageUrl?: string;
  progressItems?: { label: string; percentage: number }[];
  isGlobal?: boolean;
}

class ConstructionService {
  private updates: ConstructionUpdate[] = [
    {
      id: 'news-1',
      date: new Date(),
      title: 'Novo Plantão de Vendas Disponível',
      description: 'Convidamos todos os futuros moradores para conhecerem nosso novo espaço decorado e tirar dúvidas sobre personalização.',
      type: 'news',
      isGlobal: true
    },
    // ... keep existing code
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
      ]
    },
    {
      id: '3',
      date: new Date(2024, 0, 5),
      title: 'Fotos da Fachada',
      description: 'Confira a evolução da pintura externa e colocação de vidros.',
      type: 'photo',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    }
  ];

  getUpdates(): ConstructionUpdate[] {
    return [...this.updates].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  createUpdate(data: Omit<ConstructionUpdate, 'id'>) {
    const newUpdate = {
      ...data,
      id: `upd-${Math.random().toString(36).substr(2, 9)}`,
      date: data.date || new Date()
    };
    this.updates.push(newUpdate);
    return newUpdate;
  }

  updateUpdate(id: string, data: Partial<ConstructionUpdate>) {
    const index = this.updates.findIndex(u => u.id === id);
    if (index !== -1) {
      this.updates[index] = { ...this.updates[index], ...data };
      return this.updates[index];
    }
    return null;
  }

  deleteUpdate(id: string) {
    this.updates = this.updates.filter(u => u.id !== id);
  }

  getLatestProgress() {
    const updateWithProgress = [...this.updates]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .find(u => u.progressItems);
    return updateWithProgress?.progressItems || [];
  }
}

export const constructionService = new ConstructionService();
