import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/services';
import { AlertTriangle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const SubscriptionBanner = () => {
  const { user } = useAuth();
  
  if (!user?.company_id || user.is_super_admin) return null;
  
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (user?.company_id) {
      companyService.getById(user.company_id, undefined, true).then(setCompany);
    }
  }, [user]);

  if (!company) return null;
  
  if (company.status === 'suspended') {
    return (
      <Alert variant="destructive" className="mb-6 border-2 animate-pulse">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-black uppercase tracking-tighter">Acesso Suspenso</AlertTitle>
        <AlertDescription className="font-medium text-xs">
          Sua conta está suspensa. Entre em contato com o suporte para regularizar sua assinatura.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (company.subscription_expires_at) {
    const expires = new Date(company.subscription_expires_at);
    const now = new Date();
    const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7 && diffDays > 0) {
      return (
        <Alert className="mb-6 border-amber-500 bg-amber-500/10 text-amber-700">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="font-black uppercase tracking-tighter">Renovação Próxima</AlertTitle>
          <AlertDescription className="font-medium text-xs flex items-center justify-between">
            <span>Sua assinatura expira em {diffDays} {diffDays === 1 ? 'dia' : 'dias'}.</span>
            <Button size="sm" variant="outline" className="h-7 text-[10px] font-black uppercase border-amber-500/50 hover:bg-amber-500/20">Renovar Agora</Button>
          </AlertDescription>
        </Alert>
      );
    }
  }
  
  return null;
};
