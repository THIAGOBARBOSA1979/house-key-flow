/**
 * Abstract base class for all domain services.
 * Implements basic CRUD patterns and storage persistence.
 */
export abstract class BaseService<T extends { id?: string }> {
  protected items: T[] = [];
  protected storageKey: string;

  constructor(storageKey: string, initialData: T[] = []) {
    this.storageKey = storageKey;
    this.items = initialData;
    this.loadFromStorage();
  }

  protected loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.items = parsed;
        }
      } catch (e) {
        console.error(`Failed to load ${this.storageKey} from storage`, e);
      }
    }
  }

  protected persist() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  getAll(): T[] {
    return [...this.items];
  }

  getById(id: string): T | undefined {
    return this.items.find(item => item.id === id);
  }

  create(item: Omit<T, "id">): T {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
    } as T;
    this.items.push(newItem);
    this.persist();
    return newItem;
  }

  update(id: string, data: Partial<T>): T | undefined {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return undefined;

    this.items[index] = { ...this.items[index], ...data };
    this.persist();
    return this.items[index];
  }

  delete(id: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    if (this.items.length !== initialLength) {
      this.persist();
      return true;
    }
    return false;
  }
}
