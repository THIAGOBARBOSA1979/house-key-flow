import { clientStageService } from '../operations/ClientStageService';
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
  async onInspectionAccepted(inspectionId: string, clientId: string, companyId: string): Promise<AutomationResult> {
    const actions: string[] = [];

    try {
      const stageResult = await clientStageService.advanceStage(
        clientId, 'warranty_enabled',
        'Vistoria aceita pelo cliente - Garantia liberada automaticamente',
        'Cliente', true
      );
      if (!stageResult.success) {
        return { success: false, actions, error: (stageResult as any).error };
      }
      actions.push('Etapa do cliente atualizada para "Garantia Liberada"');

      clientStageService.addEvent({
        clientId, eventType: 'inspection_approved',
        title: 'Vistoria Aceita pelo Cliente',
        description: 'O cliente aceitou a vistoria e confirmou as condições do imóvel.',
        metadata: { relatedEntityId: inspectionId, relatedEntityType: 'inspection', isAutomatic: true }
      });
      actions.push('Evento registrado no histórico');

      notificationService.createNotification(clientId, 'inspection_approved', companyId, {
        relatedEntityId: inspectionId, relatedEntityType: 'inspection'
      });
      notificationService.createNotification(clientId, 'warranty_enabled', companyId, {
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
  async onInspectionApproved(inspectionId: string, clientId: string, companyId: string): Promise<AutomationResult> {
    const actions: string[] = [];

    try {
      const stageResult = await clientStageService.advanceStage(
        clientId, 'warranty_enabled',
        'Vistoria aprovada - Garantia liberada automaticamente',
        'Sistema', true
      );
      if (!stageResult.success) {
        return { success: false, actions, error: (stageResult as any).error };
      }
      actions.push('Etapa do cliente atualizada para "Garantia Liberada"');

      clientStageService.addEvent({
        clientId, eventType: 'inspection_approved',
        title: 'Vistoria Aprovada',
        description: 'A vistoria foi aprovada pela equipe técnica',
        metadata: { relatedEntityId: inspectionId, relatedEntityType: 'inspection', isAutomatic: true }
      });
      actions.push('Evento registrado no histórico');

      notificationService.createNotification(clientId, 'inspection_approved', companyId, {
        relatedEntityId: inspectionId, relatedEntityType: 'inspection'
      });
      notificationService.createNotification(clientId, 'warranty_enabled', companyId, {
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
  async onInspectionRejected(inspectionId: string, clientId: string, companyId: string, reason?: string): Promise<AutomationResult> {
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
      notificationService.createNotification(clientId, 'inspection_rejected', companyId, {
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
  async onInspectionScheduled(inspectionId: string, clientId: string, companyId: string, scheduledDate: Date): Promise<AutomationResult> {
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
      notificationService.createNotification(clientId, 'inspection_scheduled', companyId, {
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
  async onWarrantyRequested(warrantyId: string, clientId: string, companyId: string, itemName: string): Promise<AutomationResult> {
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
      notificationService.createNotification(clientId, 'warranty_created', companyId, {
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
  async onWarrantyCompleted(warrantyId: string, clientId: string, companyId: string): Promise<AutomationResult> {
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
      notificationService.createNotification(clientId, 'warranty_completed', companyId, {
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
  async processEvent(event: { type: EventType; clientId: string; companyId: string; entityId?: string; data?: any }): Promise<AutomationResult> {
    switch (event.type) {
      case 'inspection_approved':
        return this.onInspectionApproved(event.entityId || '', event.clientId, event.companyId);
      
      case 'inspection_rejected':
        return this.onInspectionRejected(event.entityId || '', event.clientId, event.companyId, event.data?.reason);
      
      case 'inspection_scheduled':
        return this.onInspectionScheduled(event.entityId || '', event.clientId, event.companyId, event.data?.scheduledDate);
      
      case 'warranty_requested':
        return this.onWarrantyRequested(event.entityId || '', event.clientId, event.companyId, event.data?.itemName);
      
      case 'warranty_completed':
        return this.onWarrantyCompleted(event.entityId || '', event.clientId, event.companyId);
      
      default:
        return { success: true, actions: ['No automation configured for this event type'] };
    }
  }
}

export const eventAutomationService = new EventAutomationService();
