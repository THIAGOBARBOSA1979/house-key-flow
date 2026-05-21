import { AuditAction, AuditEntityType } from "@/services/core/AuditLogService";
import { errorHandler } from "@/utils/errors/ErrorHandler";
import { BaseEntity, Listener } from "@/types/shared";

export interface BaseServiceOptions {
  storageKey: string;
  auditEntityType?: AuditEntityType;
  shouldSyncWithSupabase?: boolean;
}

export abstract class BaseService<T extends BaseEntity> {
  protected options: BaseServiceOptions;
  protected items: T[] = [];
  protected listeners: Listener<T>[] = [];

  constructor(options: BaseServiceOptions | string, initialItems: T[] = []) {
    this.options = typeof options === 'string' ? { storageKey: options } : options;
    this.items = [...initialItems];
  }

  subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  protected notifyListeners() {
    this.listeners.forEach(listener => listener(this.items));
  }

  getAllSync(companyId?: string, isSuperAdmin?: boolean): T[] {
    if (isSuperAdmin) return this.items;
    if (!companyId) return [];
    return this.items.filter(item => item.company_id === companyId);
  }

  async getAll(companyId?: string, isSuperAdmin?: boolean): Promise<T[]> {
    return this.getAllSync(companyId, isSuperAdmin);
  }

  getByIdSync(id: string, companyId?: string, isSuperAdmin?: boolean): T | undefined {
    const item = this.items.find(item => item.id === id);
    if (!item) return undefined;
    if (isSuperAdmin || item.company_id === companyId) return item;
    return undefined;
  }

  async getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<T | undefined> {
    return this.getByIdSync(id, companyId, isSuperAdmin);
  }

  protected addItem(item: T) {
    const exists = this.items.findIndex(i => i.id === item.id);
    if (exists !== -1) {
      this.items[exists] = item;
    } else {
      this.items.push(item);
    }
    this.notifyListeners();
  }

  protected updateItem(item: T) {
    const index = this.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.items[index] = item;
      this.notifyListeners();
    }
  }

  protected removeItem(id: string) {
    this.items = this.items.filter(item => item.id !== id);
    this.notifyListeners();
  }

  async create(item: Omit<T, "id">, companyId?: string): Promise<T> {
    const id = (item as any).id || crypto.randomUUID();
    const newItem = { ...item, id, company_id: companyId || (item as any).company_id } as T;
    this.addItem(newItem);
    await this.log('created', id, `Registro criado em ${this.options.storageKey}`, newItem);
    return newItem;
  }

  async update(id: string, data: Partial<T>, isSuperAdmin?: boolean): Promise<T | undefined> {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    const oldItem = { ...this.items[index] };
    const updatedItem = { ...this.items[index], ...data };
    this.updateItem(updatedItem);
    await this.log('updated', id, `Registro atualizado em ${this.options.storageKey}`, { changes: data, previous: oldItem });
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.items.length;
    this.removeItem(id);
    if (this.items.length !== initialLength) {
      await this.log('deleted', id, `Registro removido de ${this.options.storageKey}`);
      return true;
    }
    return false;
  }

  async bulkUpdate(ids: string[], data: Partial<T>): Promise<T[]> {
    const results: T[] = [];
    for (const id of ids) {
      const updated = await this.update(id, data);
      if (updated) results.push(updated);
    }
    return results;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      if (await this.delete(id)) count++;
    }
    return count;
  }

  count(companyId?: string, isSuperAdmin?: boolean): number {
    return this.getAllSync(companyId, isSuperAdmin).length;
  }

  protected handleError(error: any, context: string): never {
    throw errorHandler.handle(error, `BaseService:${this.options.storageKey}:${context}`);
  }

  public async log(action: AuditAction, entityId: string, details: string, metadata?: any) {
    if (this.options.auditEntityType) {
      try {
        const services = await import("@/services");
        if (services.auditLogService) {
          await services.auditLogService.logAction({
            action,
            entityType: this.options.auditEntityType,
            entityId,
            payload: { ...metadata, message: details }
          });
        }
      } catch (err) {
        console.error("Critical: Failed to log audit action", err);
      }
    }
  }

  clearAllData() {
    this.items = [];
    this.notifyListeners();
  }
}
