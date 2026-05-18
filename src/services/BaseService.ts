import { auditLogService, AuditAction, AuditEntityType } from "./core/AuditLogService";
import { Supabase } from "@/integrations/supabase";


type Listener<T> = (items: T[]) => void;

export interface BaseServiceOptions {
  storageKey: string;
  auditEntityType?: AuditEntityType;
  shouldSyncWithSupabase?: boolean;
}

export abstract class BaseService<T extends { id: string; company_id?: string }> {
  protected items: T[] = [];
  protected options: BaseServiceOptions;
  private listeners: Listener<T>[] = [];

  constructor(options: BaseServiceOptions | string, initialData: T[] = []) {
    if (typeof options === 'string') {
      this.options = { storageKey: options };
    } else {
      this.options = options;
    }
    this.items = initialData;
    this.loadFromStorage();
  }

  subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.items]));
  }

  protected deserializeDates(item: Record<string, unknown>): T {
    const newItem = { ...item };
    Object.keys(newItem).forEach(key => {
      const value = newItem[key];
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) newItem[key] = date;
      } else if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          newItem[key] = value.map(v => (v && typeof v === 'object') ? this.deserializeDates(v as Record<string, unknown>) : v);
        } else if (Object.getPrototypeOf(value) === Object.prototype) {
          newItem[key] = this.deserializeDates(value as Record<string, unknown>);
        }
      }
    });
    return newItem as unknown as T;
  }

  protected loadFromStorage() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(this.options.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.items = parsed.map(item => this.deserializeDates(item));
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

  protected async log(action: AuditAction, entityId: string, details: string, metadata?: any) {
    if (this.options.auditEntityType) {
      await auditLogService.logAction({
        action,
        entityType: this.options.auditEntityType,
        entityId,
        payload: { ...metadata, message: details }
      });
    }
  }

  getAll(companyId?: string, isSuperAdmin?: boolean): T[] {
    if (isSuperAdmin) {
      return [...this.items];
    }
    
    if (!companyId) {
      console.warn(`[BaseService] Attempted to getAll from ${this.options.storageKey} without companyId/isSuperAdmin`);
      return [];
    }
    
    return this.items.filter(item => item.company_id === companyId);
  }

  getById(id: string, companyId?: string, isSuperAdmin?: boolean): T | undefined {
    const item = this.items.find(item => item.id === id);
    if (isSuperAdmin) return item;
    
    if (item && item.company_id === companyId) return item;
    
    if (item && item.company_id !== companyId) {
      console.warn(`[BaseService] Tenant Isolation: Access denied to ${this.options.storageKey}:${id} (owner: ${item.company_id}, requested: ${companyId})`);
    }
    
    return undefined;
  }

  create(item: Omit<T, "id">, companyId?: string): T {
    const newItem = {
      ...item,
      id: (item as any).id || crypto.randomUUID(),
      company_id: companyId || (item as any).company_id
    } as T;
    this.items.push(newItem);
    this.persist();
    
    this.log('created', newItem.id, `Item criado em ${this.options.storageKey}`);
    
    if (this.options.shouldSyncWithSupabase) {
      Supabase.db.create(this.options.storageKey, newItem as any)
        .catch(err => console.error(`[BaseService] Failed to sync create to Supabase for ${this.options.storageKey}:`, err));
    }
    
    return newItem;
  }


  update(id: string, data: Partial<T>, isSuperAdmin?: boolean): T | undefined {
    const index = this.items.findIndex(item => item.id === id);

    if (index === -1) return undefined;
    const oldItem = { ...this.items[index] };
    this.items[index] = { ...this.items[index], ...data };
    this.persist();
    
    this.log('updated', id, `Item atualizado em ${this.options.storageKey}`, {
      changes: data,
      previous: oldItem
    });
    
    if (this.options.shouldSyncWithSupabase) {
      Supabase.db.update(this.options.storageKey, id, data as any)
        .catch(err => console.error(`[BaseService] Failed to sync update to Supabase for ${this.options.storageKey}:`, err));
    }
    
    return this.items[index];
  }


  delete(id: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    if (this.items.length !== initialLength) {
      this.persist();
      this.log('deleted', id, `Item removido de ${this.options.storageKey}`);
      return true;
    }
    return false;
  }

  count(companyId?: string, isSuperAdmin?: boolean): number {
    return this.getAll(companyId, isSuperAdmin).length;
  }

  clearAllData() {
    this.items = [];
    this.persist();
  }
}


