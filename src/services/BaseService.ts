type Listener<T> = (items: T[]) => void;

export abstract class BaseService<T extends { id?: string }> {
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
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
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
        const parsed = JSON.parse(stored) as Record<string, unknown>[];
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
    this.notify();
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


