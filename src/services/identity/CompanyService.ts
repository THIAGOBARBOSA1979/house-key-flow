import { BaseService } from "../BaseService";
import { SupabaseBaseService } from "../SupabaseBaseService";

export type CompanyStatus = 'active' | 'suspended' | 'cancelled';
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface CompanySettings {
  display_name?: string;
  logo_url?: string;
  support_email?: string;
  support_phone?: string;
  primary_color?: string;
  secondary_color?: string;
  is_dark_mode_forced?: boolean;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  status: CompanyStatus;
  owner_id: string;
  subscription_plan: SubscriptionPlan;
  subscription_expires_at?: Date;
  settings?: CompanySettings;
  created_at: Date;
  updated_at: Date;
  company_id?: string; // Multi-tenancy support for consistency
}

const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'A2 Incorporadora (Matriz)',
    slug: 'a2-incorporadora',
    status: 'active',
    owner_id: '1',
    subscription_plan: 'enterprise',
    created_at: new Date(),
    updated_at: new Date()
  }
];

class CompanyService extends SupabaseBaseService<Company> {
  constructor() {
    super({
      storageKey: "a2_companies",
      supabaseTable: "companies",
      auditEntityType: "system",
      shouldSyncWithSupabase: true
    }, []);
  }

  getCompanyBySlug(slug: string): Company | undefined {
    return this.items.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  }

  isSlugAvailable(slug: string, excludeId?: string): boolean {
    const slugLower = slug.toLowerCase().trim();
    if (!slugLower) return false;
    return !this.items.some(c => c.slug.toLowerCase() === slugLower && c.id !== excludeId);
  }

  updateSubscription(id: string, plan: SubscriptionPlan, expiresAt?: Date) {
    return this.update(id, {
      subscription_plan: plan,
      subscription_expires_at: expiresAt,
      updated_at: new Date()
    });
  }

  toggleStatus(id: string, status: CompanyStatus) {
    return this.update(id, {
      status,
      updated_at: new Date()
    });
  }

  updateSettings(id: string, settings: Partial<CompanySettings>) {
    const company = this.getById(id, undefined, true);
    if (!company) return undefined;

    return this.update(id, {
      settings: { ...company.settings, ...settings },
      updated_at: new Date()
    });
  }
}

export const companyService = new CompanyService();
