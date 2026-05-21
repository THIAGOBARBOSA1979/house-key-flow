import { type AuditAction, type AuditEntityType } from "@/services/core/AuditLogService";

type Listener<T> = (items: T[]) => void;

export interface BaseServiceOptions {
  storageKey: string;
  auditEntityType?: AuditEntityType;
  shouldSyncWithSupabase?: boolean;
}

export abstract class BaseService<T extends { id: string; company_id?: string }> {
  protected items: T[] = [];
  protected options: BaseServiceOptions;
  protected listeners: Listener<T>[] = [];

  constructor(options: BaseServiceOptions | string, initialData: T[] = []) {
    this.options = typeof options === 'string' ? { storageKey: options } : options;
    this.items = initialData;
    this.loadFromStorage();
  }

  subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  protected notify() {
    this.listeners.forEach(listener => listener([...this.items]));
  }

  protected deserializeDates(item: any): T {
    if (!item || typeof item !== 'object') return item;
    
    const newItem = { ...item };
    for (const key in newItem) {
      const value = newItem[key];
      // ISO Date pattern: 2026-05-20T...
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          newItem[key] = date;
        }
      } else if (value && typeof value === 'object' && !(value instanceof Date)) {
        newItem[key] = this.deserializeDates(value);
      }
    }
    return newItem;
  }

  protected handleError(error: any, context: string): never {
    const message = error?.message || "An unexpected error occurred";
    console.error(`[BaseService:${this.options.storageKey}] ${context}:`, error);
    throw new Error(`${context}: ${message}`);
  }


  protected loadFromStorage() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(this.options.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.items = parsed
            .filter(item => item !== null && item !== undefined)
            .map(item => this.deserializeDates(item));
        }
      } catch (e) {
        console.error(`Failed to load ${this.options.storageKey} from storage`, e);
      }
    }
  }

  protected persist() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.options.storageKey, JSON.stringify(this.items));
    this.notify();
  }

  public async log(action: AuditAction, entityId: string, details: string, metadata?: any) {
    if (this.options.auditEntityType) {
      // Use dynamic import or a deferred reference to avoid circular dependency
      const { auditLogService } = await import("@/services/core/AuditLogService");
      await auditLogService.logAction({
        action,
        entityType: this.options.auditEntityType,
        entityId,
        payload: { ...metadata, message: details }
      });
    }
  }

  getAll(companyId?: string, isSuperAdmin?: boolean): T[] {
    if (isSuperAdmin) return [...this.items];
    
    if (!companyId) {
      console.warn(`[BaseService] Attempted to getAll from ${this.options.storageKey} without companyId/isSuperAdmin`);
      return [];
    }
    
    return this.items.filter(item => item.company_id === companyId);
  }

  getById(id: string, companyId?: string, isSuperAdmin?: boolean): T | undefined {
    const item = this.items.find(item => item.id === id);
    if (!item) return undefined;
    
    if (isSuperAdmin || item.company_id === companyId) return item;
    
    console.warn(`[BaseService] Tenant Isolation: Access denied to ${this.options.storageKey}:${id}`);
    return undefined;
  }

  async create(item: Omit<T, "id">, companyId?: string): Promise<T> {
    const id = (item as any).id || crypto.randomUUID();
    const newItem = {
      ...item,
      id,
      company_id: companyId || (item as any).company_id
    } as T;
    
    this.items.push(newItem);
    this.persist();
    await this.log('created', id, `Registro criado em ${this.options.storageKey}`);
    return newItem;
  }

  async update(id: string, data: Partial<T>, isSuperAdmin?: boolean): Promise<T | undefined> {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    
    const oldItem = { ...this.items[index] };
    this.items[index] = { ...this.items[index], ...data };
    this.persist();
    
    await this.log('updated', id, `Registro atualizado em ${this.options.storageKey}`, {
      changes: data,
      previous: oldItem
    });
    
    return this.items[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    
    if (this.items.length !== initialLength) {
      this.persist();
      await this.log('deleted', id, `Registro removido de ${this.options.storageKey}`);
      return true;
    }
    return false;
  }


  async bulkUpdate(ids: string[], data: Partial<T>, isSuperAdmin?: boolean): Promise<T[]> {
    const results: T[] = [];
    for (const id of ids) {
      const updated = this.update(id, data, isSuperAdmin);
      if (updated) results.push(updated);
    }
    return results;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      if (this.delete(id)) count++;
    }
    return count;
  }

  count(companyId?: string, isSuperAdmin?: boolean): number {

    return this.getAll(companyId, isSuperAdmin).length;
  }

  clearAllData() {
    this.items = [];
    this.persist();
  }
}
