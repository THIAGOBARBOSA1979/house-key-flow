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
   * Centralized error handling.
   */
  protected handleError(error: any, context: string): never {
    throw errorHandler.handle(error, `BaseService:${this.options.storageKey}:${context}`);
  }

  /**
   * Get all items, filtered by company isolation rules.
   * Now primarily a proxy for API calls, as state is managed by TanStack Query.
   */
  async getAll(companyId?: string, isSuperAdmin?: boolean): Promise<T[]> {
    return []; // To be implemented by subclasses using Supabase
  }

  /**
   * Get a single item by ID with isolation checks.
   */
  async getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<T | undefined> {
    return undefined; // To be implemented by subclasses
  }

  /**
   * Placeholder for persistence logic.
   * @deprecated State is now managed by React Query
   */
  protected notify() {}

  /**
   * Clear all items from state.
   * @deprecated
   */
  clearAllData() {}
}
