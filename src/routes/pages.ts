import { lazy } from "react";
import { Navigate } from "react-router-dom";

// Layouts
export const AppLayout = lazy(() => import("@/components/layout/AppLayout").then(module => ({ default: module.AppLayout })));
export const ClientLayout = lazy(() => import("@/components/layout/ClientLayout"));

// Public Pages
export const Home = lazy(() => import("@/pages/Home"));
export const Login = lazy(() => import("@/pages/Login"));
export const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
export const Register = lazy(() => import("@/pages/Register"));
export const NotFound = lazy(() => import("@/pages/NotFound"));


// Admin Pages
export const AdminIndex = lazy(() => import("@/pages/Index"));
export const Properties = lazy(() => import("@/pages/Properties"));
export const Inspections = lazy(() => import("@/pages/Inspections"));
export const Warranty = lazy(() => import("@/pages/Warranty"));
export const AdminDocuments = lazy(() => import("@/pages/admin/Documents"));
export const Calendar = lazy(() => import("@/pages/Calendar"));
export const Users = lazy(() => import("@/pages/Users"));
export const ClientArea = lazy(() => import("@/pages/ClientArea"));
export const Checklist = lazy(() => import("@/pages/Checklist"));
export const Settings = lazy(() => import("@/pages/Settings"));
export const DesignSystem = lazy(() => import("@/pages/admin/DesignSystem"));
export const AuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));

export const Announcements = lazy(() => import("@/pages/admin/Announcements"));
export const Technicians = lazy(() => import("@/pages/Technicians"));
export const AdminSupport = lazy(() => import("@/pages/admin/Support"));
export const SupportInbox = lazy(() => import("@/pages/admin/SupportInbox"));
export const SaaSAdmin = lazy(() => import("@/pages/admin/SaaSAdmin"));
export const NonConformities = lazy(() => import("@/pages/admin/NonConformities"));
export const QualityIndicators = lazy(() => import("@/pages/admin/QualityIndicators"));
export const Maintenance = lazy(() => import("@/pages/Maintenance"));
export const Inbox = lazy(() => import("@/pages/Inbox"));
export const Profile = lazy(() => import("@/pages/Profile"));




// Client Pages
export const ClientDashboard = lazy(() => import("@/pages/client/Dashboard"));
export const ClientDocuments = lazy(() => import("@/pages/client/Documents"));
export const ClientInspections = lazy(() => import("@/pages/client/Inspections"));
export const ClientWarranty = lazy(() => import("@/pages/client/Warranty"));
export const ClientProperties = lazy(() => import("@/pages/client/Properties"));
export const ClientNotifications = lazy(() => import("@/pages/client/Notifications"));
export const ClientProfile = lazy(() => import("@/pages/client/Profile"));

export const ClientSupport = lazy(() => import("@/pages/client/Support"));
export const ClientFinancial = lazy(() => import("@/pages/client/Financial"));
export const ClientMaintenance = lazy(() => import("@/pages/client/Maintenance"));
