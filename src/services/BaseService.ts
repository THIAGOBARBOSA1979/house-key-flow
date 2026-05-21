import { AuditAction, AuditEntityType } from "@/services/core/AuditLogService";
import { errorHandler } from "@/utils/errors/ErrorHandler";
import { BaseEntity, Listener } from "@/types/shared";

export interface BaseServiceOptions {
  storageKey: string;
  auditEntityType?: AuditEntityType;
  shouldSyncWithSupabase?: boolean;
}

/**
 * Generic BaseService handling state, listeners, and basic CRUD operations.
 */
export abstract class BaseService<T extends BaseEntity> {
  protected items: T[] = [];
  protected options: BaseServiceOptions;
  protected listeners: Listener<T>[] = [];

  constructor(options: BaseServiceOptions | string, initialData: T[] = []) {
    this.options = typeof options === 'string' ? { storageKey: options } : options;
    this.items = initialData;
  }

  /**
   * Subscribe to state changes.
   */
  subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all subscribers of state changes.
   */
  protected notify() {
    this.listeners.forEach(listener => listener([...this.items]));
  }

  /**
   * Centralized error handling.
   */
  protected handleError(error: any, context: string): never {
    throw errorHandler.handle(error, `BaseService:${this.options.storageKey}:${context}`);
  }

  /**
   * Log administrative actions to the audit log.
   */
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

  /**
   * Get all items, filtered by company isolation rules.
   */
  getAll(companyId?: string, isSuperAdmin?: boolean): T[] {
    if (isSuperAdmin) return [...this.items];
    if (!companyId) return [];
    return this.items.filter(item => item.company_id === companyId);
  }

  /**
   * Get a single item by ID with isolation checks.
   */
  getById(id: string, companyId?: string, isSuperAdmin?: boolean): T | undefined {
    const item = this.items.find(item => item.id === id);
    if (!item) return undefined;
    if (isSuperAdmin || item.company_id === companyId) return item;
    return undefined;
  }

  /**
   * Create a new item.
   */
  async create(item: Omit<T, "id">, companyId?: string): Promise<T> {
    const id = (item as any).id || crypto.randomUUID();
    const newItem = {
      ...item,
      id,
      company_id: companyId || (item as any).company_id
    } as T;
    
    this.items.push(newItem);
    this.notify();
    await this.log('created', id, `Registro criado em ${this.options.storageKey}`);
    return newItem;
  }

  /**
   * Update an existing item.
   */
  async update(id: string, data: Partial<T>, isSuperAdmin?: boolean): Promise<T | undefined> {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    
    const oldItem = { ...this.items[index] };
    this.items[index] = { ...this.items[index], ...data };
    this.notify();
    
    await this.log('updated', id, `Registro atualizado em ${this.options.storageKey}`, {
      changes: data,
      previous: oldItem
    });
    
    return this.items[index];
  }

  /**
   * Delete an item.
   */
  async delete(id: string): Promise<boolean> {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    
    if (this.items.length !== initialLength) {
      this.notify();
      await this.log('deleted', id, `Registro removido de ${this.options.storageKey}`);
      return true;
    }
    return false;
  }

  /**
   * Batch update multiple items.
   */
  async bulkUpdate(ids: string[], data: Partial<T>, isSuperAdmin?: boolean): Promise<T[]> {
    const results: T[] = [];
    for (const id of ids) {
      const updated = await this.update(id, data, isSuperAdmin);
      if (updated) results.push(updated);
    }
    return results;
  }

  /**
   * Batch delete multiple items.
   */
  async bulkDelete(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      if (await this.delete(id)) count++;
    }
    return count;
  }

  /**
   * Count items with isolation rules.
   */
  count(companyId?: string, isSuperAdmin?: boolean): number {
    return this.getAll(companyId, isSuperAdmin).length;
  }

  /**
   * Placeholder for persistence logic.
   */
  protected persist() {
    this.notify();
  }

  /**
   * Clear all items from state.
   */
  clearAllData() {
    this.items = [];
    this.notify();
  }
}
