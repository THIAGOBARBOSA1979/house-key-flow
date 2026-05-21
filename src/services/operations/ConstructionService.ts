import { SupabaseBaseService } from "../SupabaseBaseService";

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
  readBy?: string[];
}

class ConstructionService extends SupabaseBaseService<ConstructionUpdate> {
  constructor() {
    super({
      storageKey: "a2_construction_updates",
      supabaseTable: "construction_updates",
      auditEntityType: "property",
      shouldSyncWithSupabase: true
    });
  }

  protected mapFromSupabase(raw: any): ConstructionUpdate {
    const mapped = super.mapFromSupabase(raw);
    return {
      ...mapped,
      date: raw.created_at ? new Date(raw.created_at) : mapped.date,
      progressItems: raw.progress_items || []
    };
  }

  async getUpdates(companyId?: string, isSuperAdmin?: boolean): Promise<ConstructionUpdate[]> {
    const all = await this.getAll(companyId, isSuperAdmin);
    return [...all].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getUpdatesByProperty(propertyId: string, companyId?: string, isSuperAdmin?: boolean): Promise<ConstructionUpdate[]> {
    const all = await this.getAll(companyId, isSuperAdmin);
    return all.filter(u => u.isGlobal || u.propertyId === propertyId);
  }

  async createUpdate(data: Omit<ConstructionUpdate, 'id'>, companyId?: string) {
    return await this.create({
      ...data,
      date: data.date || new Date(),
      status: data.status || 'published'
    }, companyId);
  }

  async updateUpdate(id: string, data: Partial<ConstructionUpdate>) {
    return await this.update(id, data);
  }

  async deleteUpdate(id: string) {
    return await this.delete(id);
  }

  async getLatestProgress(propertyId?: string, companyId?: string, isSuperAdmin?: boolean) {
    const source = propertyId ? await this.getUpdatesByProperty(propertyId, companyId, isSuperAdmin) : await this.getUpdates(companyId, isSuperAdmin);
    const updateWithProgress = [...source]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .find(u => u.progressItems && u.progressItems.length > 0);
    return updateWithProgress?.progressItems || [];
  }

  async markAsRead(updateId: string, userId: string) {
    const update = this.getByIdSync(updateId);
    if (update) {
      const readBy = update.readBy || [];
      if (!readBy.includes(userId)) {
        await this.update(updateId, { readBy: [...readBy, userId] });
      }
    }
  }
}

export const constructionService = new ConstructionService();
