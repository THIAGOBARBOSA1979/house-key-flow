import { SupabaseBaseService } from "../SupabaseBaseService";

export interface Asset {
  id: string;
  company_id: string;
  property_id: string;
  name: string;
  category: "HVAC" | "Electrical" | "Plumbing" | "Elevator" | "Fire Safety" | "Other";
  brand?: string;
  model?: string;
  serial_number?: string;
  installation_date?: Date;
  warranty_expiration?: Date;
  status: "active" | "maintenance" | "broken" | "retired";
  last_maintenance_date?: Date;
  next_maintenance_date?: Date;
}

export class AssetService extends SupabaseBaseService<Asset> {
  constructor() {
    super("assets");
  }

  async getByProperty(propertyId: string): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("property_id", propertyId);

    if (error) this.handleError(error);
    return data || [];
  }

  async getCriticalAssets(): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*, properties(title)")
      .or("status.eq.broken,status.eq.maintenance");

    if (error) this.handleError(error);
    return data || [];
  }
}

export const assetService = new AssetService();
