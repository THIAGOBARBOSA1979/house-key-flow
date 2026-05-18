
import { auditLogService } from '../core/AuditLogService';

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

    const interval = setInterval(() => {
      if (Date.now() - this.lastActivity > this.SESSION_TIMEOUT) {
        const user = localStorage.getItem('auth_user');
        if (user) {
          auditLogService.log({
            entityType: 'system',
            entityId: 'session',
            action: 'logged_out',
            performedBy: 'system',
            performedByName: 'Sistema',
            performedByRole: 'user',
            details: 'Sessão encerrada por inatividade.'
          });
          logoutFn();
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
    return str.replace(/[<>]/g, ''); // Simple XSS prevention
  }
}

export const securityService = SystemSecurityService;
