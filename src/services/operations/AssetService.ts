import { SupabaseBaseService, SupabaseBaseServiceOptions } from "../SupabaseBaseService";
import { BaseEntity } from "@/types/shared";

export interface Asset extends BaseEntity {
  propertyId: string;
  name: string;
  category: "HVAC" | "Electrical" | "Plumbing" | "Elevator" | "Fire Safety" | "Other";
  brand?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string;
  warrantyExpiration?: string;
  status: "active" | "maintenance" | "broken" | "retired";
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export class AssetService extends SupabaseBaseService<Asset> {
  constructor() {
    const options: SupabaseBaseServiceOptions = {
      supabaseTable: "assets",
      fieldMapping: {
        propertyId: "property_id",
        serialNumber: "serial_number",
        installationDate: "installation_date",
        warrantyExpiration: "warranty_expiration",
        lastMaintenanceDate: "last_maintenance_date",
        nextMaintenanceDate: "next_maintenance_date"
      }
    };
    super(options);
  }

  async getByProperty(propertyId: string): Promise<Asset[]> {
    return this.getAll(undefined, true, [
      { column: "property_id", operator: "eq", value: propertyId }
    ]);
  }

  async getCriticalAssets(): Promise<Asset[]> {
    return this.getAll(undefined, true, [
      { column: "status", operator: "in", value: ["broken", "maintenance"] }
    ]);
  }
}

export const assetService = new AssetService();
