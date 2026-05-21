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
  protected options: BaseServiceOptions;
  protected listeners: Listener<T>[] = [];

  constructor(options: BaseServiceOptions | string) {
    this.options = typeof options === 'string' ? { storageKey: options } : options;
  }

  /**
   * Subscribe to state changes.
   * @deprecated React Query is now the source of truth for state
   */
  subscribe(listener: Listener<T>) {
    return () => {};
  }

  /**
   * Get all items, filtered by company isolation rules.
   * Now primarily a proxy for API calls, as state is managed by TanStack Query.
   */
  async getAll(companyId?: string, isSuperAdmin?: boolean): Promise<T[]> {
    return [];
  }

  /**
   * Get a single item by ID with isolation checks.
   */
  async getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<T | undefined> {
    return undefined;
  }

  /**
   * Create a new item.
   */
  async create(item: Omit<T, "id">, companyId?: string): Promise<T> {
    return { id: crypto.randomUUID(), ...item } as any;
  }

  /**
   * Update an existing item.
   */
  async update(id: string, data: Partial<T>, isSuperAdmin?: boolean): Promise<T | undefined> {
    return undefined;
  }

  /**
   * Delete an item.
   */
  async delete(id: string): Promise<boolean> {
    return true;
  }

  async bulkUpdate(ids: string[], data: Partial<T>): Promise<T[]> {
    return [];
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return 0;
  }

  /**
   * Get a single item by ID with isolation checks.
   */
  async getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<T | undefined> {
    return undefined; // To be implemented by subclasses
  }

  async bulkUpdate(ids: string[], data: Partial<T>): Promise<T[]> {
    return [];
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return 0;
  }

  /**
   * Centralized error handling.
   */
  protected handleError(error: any, context: string): never {
    throw errorHandler.handle(error, `BaseService:${this.options.storageKey}:${context}`);
  }

  /**
   * Clear all items from state.
   * @deprecated
   */
  clearAllData() {}
}
