type Listener<T> = (items: T[]) => void;

export abstract class BaseService<T extends { id: string; company_id?: string }> {
  protected items: T[] = [];
  protected storageKey: string;
  private listeners: Listener<T>[] = [];

  constructor(storageKey: string, initialData: T[] = []) {
    this.storageKey = storageKey;
    this.items = initialData;
    this.loadFromStorage();
  }

  subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
    // Return unsubscribe function immediately
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
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
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
    this.notify();
  }

  async getAll(companyId?: string, isSuperAdmin?: boolean): Promise<T[]> {
    if (isSuperAdmin) {
      return [...this.items];
    }
    
    if (!companyId) {
      console.warn(`[BaseService] Attempted to getAll from ${this.storageKey} without companyId/isSuperAdmin`);
      return [];
    }
    
    return this.items.filter(item => item.company_id === companyId);
  }

  async getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<T | undefined> {
    const item = this.items.find(item => item.id === id);
    if (isSuperAdmin) return item;
    if (item && item.company_id === companyId) return item;
    return undefined;
  }

  async create(item: Omit<T, "id">, companyId?: string): Promise<T> {
    const newItem = {
      ...item,
      id: (item as any).id || crypto.randomUUID(),
      company_id: companyId || (item as any).company_id
    } as T;
    this.items.push(newItem);
    this.persist();
    return newItem;
  }

  async update(id: string, data: Partial<T>): Promise<T | undefined> {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    this.items[index] = { ...this.items[index], ...data };
    this.persist();
    return this.items[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    if (this.items.length !== initialLength) {
      this.persist();
      return true;
    }
    return false;
  }

  async count(companyId?: string, isSuperAdmin?: boolean): Promise<number> {
    const items = await this.getAll(companyId, isSuperAdmin);
    return items.length;
  }

  clearAllData() {
    this.items = [];
    this.persist();
  }
}


