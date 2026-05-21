import { AuditAction, AuditEntityType } from "@/services/core/AuditLogService";
import { errorHandler } from "@/utils/errors/ErrorHandler";
import { BaseEntity, Listener } from "@/types/shared";

export interface BaseServiceOptions {
  storageKey: string;
  auditEntityType?: AuditEntityType;
  shouldSyncWithSupabase?: boolean;
}

/**
 * Generic BaseService handling basic operations.
 * Stateless version to be used with React Query.
 */
export abstract class BaseService<T extends BaseEntity> {
  protected options: BaseServiceOptions;
  protected items: T[] = [];

  constructor(options: BaseServiceOptions | string) {
    this.options = typeof options === 'string' ? { storageKey: options } : options;
  }

  subscribe(listener: Listener<T>) {
    return () => {};
  }

  async getAll(companyId?: string, isSuperAdmin?: boolean): Promise<T[]> {
    return this.items;
  }

  getAllSync(companyId?: string, isSuperAdmin?: boolean): T[] {
    return this.items;
  }

  async getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<T | undefined> {
    return this.items.find(i => i.id === id);
  }

  getByIdSync(id: string): T | undefined {
    return this.items.find(i => i.id === id);
  }

  async create(item: Omit<T, "id">, companyId?: string): Promise<T> {
    return { id: crypto.randomUUID(), ...item } as any;
  }

  async update(id: string, data: Partial<T>, isSuperAdmin?: boolean): Promise<T | undefined> {
    return undefined;
  }

  async delete(id: string): Promise<boolean> {
    return true;
  }

  async bulkUpdate(ids: string[], data: Partial<T>): Promise<T[]> {
    return [];
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return 0;
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

  clearAllData() {}
}
