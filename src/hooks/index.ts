// Shared Hooks
export * from './shared/use-toast';
export * from './shared/use-mobile';
export * from './shared/useDataTable';
export * from './shared/useDataList';
export * from './shared/useService';
export * from './shared/useDebounce';
export { useConfirm } from '@/contexts/ConfirmContext';

// Identity Domain
export * from './identity/useUsers';
export * from './identity/useSaaSAdmin';

// Operations Domain
export * from './operations/useProperties';
export * from './operations/useInspections';
export * from './operations/useCalendar';
export * from './operations/useClientStage';
export * from './operations/useTechnicians';
export * from './operations/useAnnouncements';

// Warranty Domain
export * from './warranty/useWarranty';

// Core Domain
export * from './core/useAuditLogs';
export * from './core/useNotifications';
export * from './core/useDashboardData';

// Queries
export * from './queries/usePropertyQueries';

