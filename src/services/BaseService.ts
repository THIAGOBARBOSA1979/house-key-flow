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

  /**
   * Helper to deserialize dates from storage
   */
  protected deserializeDates(item: any): T {
    const newItem = { ...item };
    Object.keys(newItem).forEach(key => {
      const value = newItem[key];
      // Basic heuristic for date strings
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          newItem[key] = date;
        }
      } else if (value && typeof value === 'object') {
        // Recursive check for nested objects/arrays
        if (Array.isArray(value)) {
          newItem[key] = value.map(v => typeof v === 'object' ? this.deserializeDates(v) : v);
        } else {
          // Avoid recursion on null or non-plain objects
          if (Object.getPrototypeOf(value) === Object.prototype) {
            newItem[key] = this.deserializeDates(value);
          }
        }
      }
    });
    return newItem as T;
  }

  protected loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.items = parsed.map(item => this.deserializeDates(item));
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

