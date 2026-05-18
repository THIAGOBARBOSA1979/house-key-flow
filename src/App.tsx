
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { BrandThemeProvider } from "@/components/shared/BrandThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";

import { lazy, Suspense } from "react";
import { SkeletonLoader } from "./components/shared/SkeletonLoader";

// Public pages (Lazy loaded)
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

// Admin pages and layout (Lazy loaded)
const AppLayout = lazy(() => import("./components/Layout/AppLayout").then(module => ({ default: module.AppLayout })));
const AdminDocuments = lazy(() => import("./pages/admin/Documents"));
const DesignSystem = lazy(() => import("./pages/admin/DesignSystem"));
const Index = lazy(() => import("./pages/Index"));
const Properties = lazy(() => import("./pages/Properties"));
const Inspections = lazy(() => import("./pages/Inspections"));
const Warranty = lazy(() => import("./pages/Warranty"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Users = lazy(() => import("./pages/Users"));
const ClientArea = lazy(() => import("./pages/ClientArea"));
const Checklist = lazy(() => import("./pages/Checklist"));
const Settings = lazy(() => import("./pages/Settings"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const FinancialDashboard = lazy(() => import("./pages/admin/FinancialDashboard"));
const Announcements = lazy(() => import("./pages/admin/Announcements"));
const Technicians = lazy(() => import("./pages/Technicians"));
const AdminSupport = lazy(() => import("./pages/admin/Support"));
const SaaSAdmin = lazy(() => import("./pages/admin/SaaSAdmin"));


// Client pages and layout (Lazy loaded)
const ClientLayout = lazy(() => import("./components/Layout/ClientLayout"));
const ClientDashboard = lazy(() => import("./pages/client/Dashboard"));
const ClientDocuments = lazy(() => import("./pages/client/Documents"));
const ClientInspections = lazy(() => import("./pages/client/Inspections"));
const ClientWarranty = lazy(() => import("./pages/client/Warranty"));
const ClientProperties = lazy(() => import("./pages/client/Properties"));
const ClientNotifications = lazy(() => import("./pages/client/Notifications"));
const ClientProfile = lazy(() => import("./pages/client/Profile"));
const ClientFinancial = lazy(() => import("./pages/client/Financial"));
const ClientSupport = lazy(() => import("./pages/client/Support"));

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Suspense fallback={<SkeletonLoader type="page" />}>
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Redirect legacy login paths */}
                <Route path="/admin/login" element={<Navigate to="/login" replace />} />
                <Route path="/client/login" element={<Navigate to="/login" replace />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AppLayout /></ProtectedRoute>}>
                  <Route index element={<Index />} />
                  <Route path="properties" element={<Properties />} />
                  <Route path="inspections" element={<Inspections />} />
                  <Route path="warranty" element={<Warranty />} />
                  <Route path="documents" element={<AdminDocuments />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="users" element={<Users />} />
                  <Route path="client-area" element={<ClientArea />} />
                  <Route path="checklist" element={<Checklist />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="design-system" element={<DesignSystem />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="financial" element={<FinancialDashboard />} />
                  <Route path="announcements" element={<Announcements />} />
                  <Route path="technicians" element={<Technicians />} />
                  <Route path="support" element={<AdminSupport />} />
                  <Route path="saas" element={<SaaSAdmin />} />
                </Route>


                {/* Protected Client Routes */}
                <Route path="/client" element={<ProtectedRoute requiredRole="client"><ClientLayout /></ProtectedRoute>}>
                  <Route index element={<ClientDashboard />} />
                  <Route path="documents" element={<ClientDocuments />} />
                  <Route path="inspections" element={<ClientInspections />} />
                  <Route path="warranty" element={<ClientWarranty />} />
                  <Route path="properties" element={<ClientProperties />} />
                  <Route path="notifications" element={<ClientNotifications />} />
                  <Route path="profile" element={<ClientProfile />} />
                  <Route path="financial" element={<ClientFinancial />} />
                  <Route path="support" element={<ClientSupport />} />
                </Route>

                {/* Legacy redirects for top-level paths */}
                <Route path="/properties" element={<Navigate to="/admin/properties" replace />} />
                <Route path="/inspections" element={<Navigate to="/admin/inspections" replace />} />
                <Route path="/warranty" element={<Navigate to="/admin/warranty" replace />} />
                <Route path="/calendar" element={<Navigate to="/admin/calendar" replace />} />
                <Route path="/users" element={<Navigate to="/admin/users" replace />} />
                <Route path="/client-area" element={<Navigate to="/admin/client-area" replace />} />
                <Route path="/checklist" element={<Navigate to="/admin/checklist" replace />} />
                <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </GlobalErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
