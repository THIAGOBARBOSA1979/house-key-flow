import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Supabase } from '@/integrations/supabase';
import { PlanFeature } from '@/types/auth';

interface SubscriptionContextType {
  plan: any | null;
  features: PlanFeature[];
  limits: {
    maxProperties: number;
    maxUsers: number;
    maxStorageMb: number;
  };
  isLoading: boolean;
  hasFeature: (feature: PlanFeature) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.company_id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: company, error } = await Supabase.db.findOne<any>('companies', user.company_id);
        
        if (company?.plan_id) {
          const { data: planData } = await Supabase.db.findOne<any>('plans', company.plan_id);
          setPlan(planData);
        } else {
          // Default Trial Plan for new/unassigned companies
          const { data: plans } = await Supabase.db.findMany<any>('plans', {
            filters: [{ column: 'name', operator: 'eq', value: 'Trial' }]
          });
          if (plans && plans.length > 0) {
            setPlan(plans[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const features = (plan?.features as PlanFeature[]) || [];
  
  const hasFeature = (feature: PlanFeature) => {
    if (user?.is_super_admin) return true;
    return features.includes(feature);
  };

  const limits = {
    maxProperties: plan?.max_properties || 0,
    maxUsers: plan?.max_users || 0,
    maxStorageMb: plan?.max_storage_mb || 0,
  };

  return (
    <SubscriptionContext.Provider value={{ plan, features, limits, isLoading, hasFeature }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
