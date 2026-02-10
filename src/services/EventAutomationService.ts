import { clientStageService } from './ClientStageService';
import { notificationService } from './NotificationService';
import { ClientEvent, EventType } from '@/types/clientFlow';
import { auditLogService } from './AuditLogService';

export interface AutomationResult {
  success: boolean;
  actions: string[];
  error?: string;
}

class EventAutomationService {
  // Process inspection accepted by client
  onInspectionAccepted(inspectionId: string, clientId: string): AutomationResult {
    const actions: string[] = [];

    try {
      const stageResult = clientStageService.advanceStage(
        clientId, 'warranty_enabled',
        'Vistoria aceita pelo cliente - Garantia liberada automaticamente',
        'Cliente', true
      );
      if (!stageResult.success) {
        return { success: false, actions, error: stageResult.error };
      }
      actions.push('Etapa do cliente atualizada para "Garantia Liberada"');

      clientStageService.addEvent({
        clientId, eventType: 'inspection_approved',
        title: 'Vistoria Aceita pelo Cliente',
        description: 'O cliente aceitou a vistoria e confirmou as condições do imóvel.',
        metadata: { relatedEntityId: inspectionId, relatedEntityType: 'inspection', isAutomatic: true }
      });
      actions.push('Evento registrado no histórico');

      notificationService.createNotification(clientId, 'inspection_approved', {
        relatedEntityId: inspectionId, relatedEntityType: 'inspection'
      });
      notificationService.createNotification(clientId, 'warranty_enabled', {
        relatedEntityType: 'stage'
      });
      actions.push('Notificações criadas');

      auditLogService.log({
        entityType: 'inspection', entityId: inspectionId, action: 'accepted',
        performedBy: clientId, performedByName: 'Cliente', performedByRole: 'client',
        details: 'Vistoria aceita pelo cliente. Módulo de garantias liberado.'
      });
      actions.push('Log de auditoria registrado');

      return { success: true, actions };
    } catch (error) {
      console.error('[EventAutomation] Error:', error);
      return { success: false, actions, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  // Process inspection approved event (admin)
  onInspectionApproved(inspectionId: string, clientId: string): AutomationResult {
    const actions: string[] = [];

    try {
      const stageResult = clientStageService.advanceStage(
        clientId, 'warranty_enabled',
        'Vistoria aprovada - Garantia liberada automaticamente',
        'Sistema', true
      );
      if (!stageResult.success) {
        return { success: false, actions, error: stageResult.error };
      }
      actions.push('Etapa do cliente atualizada para "Garantia Liberada"');

      clientStageService.addEvent({
        clientId, eventType: 'inspection_approved',
        title: 'Vistoria Aprovada',
        description: 'A vistoria foi aprovada pela equipe técnica',
        metadata: { relatedEntityId: inspectionId, relatedEntityType: 'inspection', isAutomatic: true }
      });
      actions.push('Evento registrado no histórico');

      notificationService.createNotification(clientId, 'inspection_approved', {
        relatedEntityId: inspectionId, relatedEntityType: 'inspection'
      });
      notificationService.createNotification(clientId, 'warranty_enabled', {
        relatedEntityType: 'stage'
      });
      actions.push('Notificações criadas');

      auditLogService.log({
        entityType: 'inspection', entityId: inspectionId, action: 'accepted',
        performedBy: 'admin-1', performedByName: 'Sistema', performedByRole: 'admin',
        details: 'Vistoria aprovada pela equipe técnica. Módulo de garantias liberado.'
      });

      return { success: true, actions };
    } catch (error) {
      console.error('[EventAutomation] Error:', error);
      return { success: false, actions, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  // Process inspection rejected event
  onInspectionRejected(inspectionId: string, clientId: string, reason?: string): AutomationResult {
    const actions: string[] = [];

    try {
      // 1. Keep client at current stage (no advancement)
      actions.push('Cliente mantido na etapa atual');

      // 2. Register event in history
      clientStageService.addEvent({
        clientId,
        eventType: 'inspection_rejected',
        title: 'Vistoria com Pendências',
        description: reason || 'A vistoria identificou itens que precisam de ajustes',
        metadata: {
          relatedEntityId: inspectionId,
          relatedEntityType: 'inspection',
          isAutomatic: true
        }
      });
      actions.push('Evento registrado no histórico');

      // 3. Create notification
      notificationService.createNotification(clientId, 'inspection_rejected', {
        relatedEntityId: inspectionId,
        relatedEntityType: 'inspection'
      });
      actions.push('Notificação de pendência criada');

      auditLogService.log({
        entityType: 'inspection', entityId: inspectionId, action: 'rejected',
        performedBy: clientId, performedByName: 'Cliente', performedByRole: 'client',
        details: `Vistoria recusada pelo cliente. Motivo: ${reason || 'Não informado'}`
      });

      return { success: true, actions };
    } catch (error) {
      console.error('[EventAutomation] Error processing inspection rejected:', error);
      return { 
        success: false, 
        actions, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Process inspection scheduled event
  onInspectionScheduled(inspectionId: string, clientId: string, scheduledDate: Date): AutomationResult {
    const actions: string[] = [];

    try {
      // 1. Register event
      clientStageService.addEvent({
        clientId,
        eventType: 'inspection_scheduled',
        title: 'Vistoria Agendada',
        description: `Vistoria agendada para ${scheduledDate.toLocaleDateString('pt-BR')}`,
        metadata: {
          relatedEntityId: inspectionId,
          relatedEntityType: 'inspection',
          isAutomatic: true
        }
      });
      actions.push('Evento registrado no histórico');

      // 2. Create notification
      notificationService.createNotification(clientId, 'inspection_scheduled', {
        relatedEntityId: inspectionId,
        relatedEntityType: 'inspection'
      });
      actions.push('Notificação de agendamento criada');

      console.log('[EventAutomation] Inspection scheduled automation completed:', {
        clientId,
        inspectionId,
        scheduledDate,
        actions
      });

      return { success: true, actions };
    } catch (error) {
      console.error('[EventAutomation] Error processing inspection scheduled:', error);
      return { 
        success: false, 
        actions, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Process warranty request created event
  onWarrantyRequested(warrantyId: string, clientId: string, itemName: string): AutomationResult {
    const actions: string[] = [];

    try {
      // 1. Register event
      clientStageService.addEvent({
        clientId,
        eventType: 'warranty_requested',
        title: 'Solicitação de Garantia',
        description: `Nova solicitação de garantia para: ${itemName}`,
        metadata: {
          relatedEntityId: warrantyId,
          relatedEntityType: 'warranty',
          isAutomatic: true
        }
      });
      actions.push('Evento registrado no histórico');

      // 2. Create notification
      notificationService.createNotification(clientId, 'warranty_created', {
        relatedEntityId: warrantyId,
        relatedEntityType: 'warranty'
      });
      actions.push('Notificação de solicitação criada');

      console.log('[EventAutomation] Warranty requested automation completed:', {
        clientId,
        warrantyId,
        itemName,
        actions
      });

      return { success: true, actions };
    } catch (error) {
      console.error('[EventAutomation] Error processing warranty requested:', error);
      return { 
        success: false, 
        actions, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Process warranty completed event
  onWarrantyCompleted(warrantyId: string, clientId: string): AutomationResult {
    const actions: string[] = [];

    try {
      // 1. Register event
      clientStageService.addEvent({
        clientId,
        eventType: 'warranty_completed',
        title: 'Garantia Concluída',
        description: 'Solicitação de garantia concluída com sucesso',
        metadata: {
          relatedEntityId: warrantyId,
          relatedEntityType: 'warranty',
          isAutomatic: true
        }
      });
      actions.push('Evento registrado no histórico');

      // 2. Create notification
      notificationService.createNotification(clientId, 'warranty_completed', {
        relatedEntityId: warrantyId,
        relatedEntityType: 'warranty'
      });
      actions.push('Notificação de conclusão criada');

      return { success: true, actions };
    } catch (error) {
      console.error('[EventAutomation] Error processing warranty completed:', error);
      return { 
        success: false, 
        actions, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Generic event processor
  processEvent(event: { type: EventType; clientId: string; entityId?: string; data?: any }): AutomationResult {
    switch (event.type) {
      case 'inspection_approved':
        return this.onInspectionApproved(event.entityId || '', event.clientId);
      
      case 'inspection_rejected':
        return this.onInspectionRejected(event.entityId || '', event.clientId, event.data?.reason);
      
      case 'inspection_scheduled':
        return this.onInspectionScheduled(event.entityId || '', event.clientId, event.data?.scheduledDate);
      
      case 'warranty_requested':
        return this.onWarrantyRequested(event.entityId || '', event.clientId, event.data?.itemName);
      
      case 'warranty_completed':
        return this.onWarrantyCompleted(event.entityId || '', event.clientId);
      
      default:
        return { success: true, actions: ['No automation configured for this event type'] };
    }
  }
}

export const eventAutomationService = new EventAutomationService();
