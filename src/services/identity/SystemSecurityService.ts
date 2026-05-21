import { auditLogService } from '../core/AuditLogService';
import { errorHandler } from '@/utils/errors/ErrorHandler';
import { Supabase } from '@/integrations/supabase';


class SystemSecurityService {
  private static SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static lastActivity = Date.now();

  static initialize(logoutFn: () => void) {
    if (typeof window === 'undefined') return;

    const resetActivity = () => {
      this.lastActivity = Date.now();
    };

    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keydown', resetActivity);
    window.addEventListener('click', resetActivity);
    window.addEventListener('scroll', resetActivity);

    const interval = setInterval(async () => {
      if (Date.now() - this.lastActivity > this.SESSION_TIMEOUT) {
        try {
          const session = await Supabase.auth.getSession();
          if (session?.user) {
            auditLogService.log({
              entityType: 'system',
              entityId: 'session',
              action: 'logged_out',
              performedBy: 'system',
              performedByName: 'Sistema',
              performedByRole: 'user',
              details: 'Sessão encerrada por inatividade.'
            }).catch(err => errorHandler.handle(err, 'SystemSecurityService:sessionTimeoutLog'));

            logoutFn();
          }
        } catch (err) {
          errorHandler.handle(err, 'SystemSecurityService:sessionTimeout');
        }
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('click', resetActivity);
      window.removeEventListener('scroll', resetActivity);
      clearInterval(interval);
    };
  }

  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static sanitizeString(str: string): string {
    if (!str) return '';
    return str
      .replace(/[<>]/g, '') // Basic tag removal
      .replace(/javascript:/gi, '') // Protocol removal
      .replace(/on\w+=/gi, '') // Event handler removal
      .trim();
  }
}

export const securityService = SystemSecurityService;
