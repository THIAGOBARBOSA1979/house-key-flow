
import { z } from "zod";

export const propertySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  location: z.string().min(5, "A localização deve ter pelo menos 5 caracteres"),
  units: z.number().min(1, "O número de unidades deve ser pelo menos 1"),
  completedUnits: z.number().min(0).default(0),
  status: z.enum(["pending", "progress", "complete"]).default("pending"),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
});

export type Property = z.infer<typeof propertySchema>;

class PropertyService {
  private properties: Property[] = [
    { id: "1", name: "Edifício Aurora", location: "São Paulo, SP", units: 120, completedUnits: 85, status: "progress" },
    { id: "2", name: "Residencial Bosque Verde", location: "Rio de Janeiro, RJ", units: 75, completedUnits: 75, status: "complete" },
    { id: "3", name: "Condomínio Monte Azul", location: "Belo Horizonte, MG", units: 50, completedUnits: 10, status: "pending" },
    { id: "4", name: "Residencial Parque das Flores", location: "Curitiba, PR", units: 60, completedUnits: 60, status: "complete" },
    { id: "5", name: "Condomínio Vista Mar", location: "Salvador, BA", units: 40, completedUnits: 35, status: "progress" },
    { id: "6", name: "Edifício Horizonte", location: "Brasília, DF", units: 80, completedUnits: 0, status: "pending" },
  ];

  private storageKey = "a2_properties";

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.properties = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load properties from storage", e);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.properties));
  }

  getAll(): Property[] {
    return [...this.properties];
  }

  getById(id: string): Property | undefined {
    return this.properties.find(p => p.id === id);
  }

  create(property: Omit<Property, "id">): Property {
    const newProperty = {
      ...property,
      id: Math.random().toString(36).substr(2, 9),
    };
    this.properties.push(newProperty);
    this.persist();
    return newProperty;
  }

  update(id: string, property: Partial<Property>): Property | undefined {
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    this.properties[index] = { ...this.properties[index], ...property };
    this.persist();
    return this.properties[index];
  }

  delete(id: string): boolean {
    const initialLength = this.properties.length;
    this.properties = this.properties.filter(p => p.id !== id);
    if (this.properties.length !== initialLength) {
      this.persist();
      return true;
    }
    return false;
  }
}

export const propertyService = new PropertyService();
