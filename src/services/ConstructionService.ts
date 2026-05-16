
export interface ConstructionUpdate {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'milestone' | 'photo' | 'document' | 'video';
  imageUrl?: string;
  progressItems?: { label: string; percentage: number }[];
}

class ConstructionService {
  private updates: ConstructionUpdate[] = [
    {
      id: '1',
      date: new Date(2024, 2, 10),
      title: 'Início do Acabamento',
      description: 'As equipes iniciaram a colocação dos pisos e revestimentos nas unidades do Bloco A.',
      type: 'milestone',
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&w=800&q=80',
      progressItems: [
        { label: 'Estrutura', percentage: 100 },
        { label: 'Alvenaria', percentage: 100 },
        { label: 'Instalações', percentage: 85 },
        { label: 'Acabamento', percentage: 15 }
      ]
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
    return this.updates;
  }

  getLatestProgress() {
    return this.updates[0].progressItems || [];
  }
}

export const constructionService = new ConstructionService();
