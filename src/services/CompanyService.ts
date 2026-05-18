import { BaseService } from "./BaseService";

export type CompanyStatus = 'active' | 'suspended' | 'cancelled';
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface Company {
  id: string;
  name: string;
  slug: string;
  status: CompanyStatus;
  owner_id: string;
  subscription_plan: SubscriptionPlan;
  subscription_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
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

class CompanyService extends BaseService<Company> {
  constructor() {
    super("a2_companies", INITIAL_COMPANIES);
  }

  getCompanyBySlug(slug: string): Company | undefined {
    return this.items.find(c => c.slug === slug);
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
}

export const companyService = new CompanyService();
