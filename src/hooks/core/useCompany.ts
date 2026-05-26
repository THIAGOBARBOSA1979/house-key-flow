import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { companyService, Company } from '@/services';

export const useCompany = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCompany = async () => {
      if (!user?.company_id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await companyService.getById(user.company_id, undefined, true);
        if (isMounted) {
          setCompany(data || null);
        }
      } catch (error) {
        console.error('Error fetching company:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCompany();

    return () => {
      isMounted = false;
    };
  }, [user?.company_id]);

  return { company, isLoading };
};