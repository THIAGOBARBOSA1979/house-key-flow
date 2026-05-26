
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { BrandThemeProvider } from "@/components/shared/BrandThemeProvider";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { AuditProgressOverlay } from "./components/shared/AuditProgressOverlay";


import { lazy, Suspense } from "react";
import { SkeletonLoader } from "./components/shared/SkeletonLoader";

import * as Pages from "./routes/pages";


import { useAuditInitializer } from "./hooks/useAuditInitializer";

const App = () => {
  useAuditInitializer();
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
          <AuditProgressOverlay />
          <BrowserRouter>
            <AuthProvider>
              <TenantProvider>
                <BrandThemeProvider>
                <SubscriptionProvider>
                  <ConfirmProvider>


                <Suspense fallback={<SkeletonLoader type="page" />}>
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Pages.Home />} />
                <Route path="/login" element={<Pages.Login />} />
                <Route path="/forgot-password" element={<Pages.ForgotPassword />} />
                <Route path="/register" element={<Pages.Register />} />

                {/* Redirect legacy login paths to global login */}
                <Route path="/app/login" element={<Navigate to="/login" replace />} />
                <Route path="/client/login" element={<Navigate to="/login" replace />} />
                <Route path="/app/login" element={<Navigate to="/login" replace />} />
                
                {/* Protected Super Admin Routes */}
                <Route path="/super-admin" element={<ProtectedRoute requiredRole="super_admin"><Pages.AppLayout /></ProtectedRoute>}>
                  <Route index element={<Pages.SaaSAdmin />} />
                  <Route path="audit-logs" element={<Pages.AuditLogs />} />
                  <Route path="design-system" element={<Pages.DesignSystem />} />
                </Route>

                {/* Protected Tenant/App Routes */}
                <Route path="/app" element={<ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'technical']}><Pages.AppLayout /></ProtectedRoute>}>
                  <Route index element={<Pages.AdminIndex />} />
                  <Route path="properties" element={<Pages.Properties />} />
                  <Route path="inspections" element={<Pages.Inspections />} />
                  <Route path="warranty" element={<Pages.Warranty />} />
                  <Route path="documents" element={<Pages.AdminDocuments />} />
                  <Route path="calendar" element={<Pages.Calendar />} />
                  <Route path="users" element={<Pages.Users />} />
                  <Route path="ClientArea" element={<Pages.ClientArea />} />
                  <Route path="checklist" element={<Pages.Checklist />} />
                  <Route path="non-conformities" element={<Pages.NonConformities />} />
                  <Route path="quality" element={<Pages.QualityIndicators />} />
                  <Route path="settings" element={<Pages.Settings />} />
                  <Route path="announcements" element={<Pages.Announcements />} />
                  <Route path="technicians" element={<Pages.Technicians />} />
                  <Route path="support" element={<Pages.AdminSupport />} />
                  <Route path="inbox" element={<Pages.SupportInbox />} />
                </Route>

                {/* Protected Client Routes */}
                <Route path="/client" element={<ProtectedRoute requiredRole={['user', 'admin', 'super_admin', 'manager', 'staff', 'technical']}><Pages.ClientLayout /></ProtectedRoute>}>
                  <Route index element={<Pages.ClientDashboard />} />
                  <Route path="documents" element={<Pages.ClientDocuments />} />
                  <Route path="inspections" element={<Pages.ClientInspections />} />
                  <Route path="warranty" element={<Pages.ClientWarranty />} />
                  <Route path="properties" element={<Pages.ClientProperties />} />
                  <Route path="notifications" element={<Pages.ClientNotifications />} />
                  <Route path="profile" element={<Pages.ClientProfile />} />
                  <Route path="support" element={<Pages.ClientSupport />} />
                </Route>

                {/* Legacy redirects for top-level paths and /admin */}
                <Route path="/app" element={<Navigate to="/app" replace />} />
                <Route path="/app/*" element={<Navigate to="/app" replace />} />
                <Route path="/properties" element={<Navigate to="/app/properties" replace />} />
                <Route path="/inspections" element={<Navigate to="/app/inspections" replace />} />
                <Route path="/warranty" element={<Navigate to="/app/warranty" replace />} />
                <Route path="/calendar" element={<Navigate to="/app/calendar" replace />} />
                <Route path="/users" element={<Navigate to="/app/users" replace />} />
                <Route path="/ClientArea" element={<Navigate to="/app/ClientArea" replace />} />
                <Route path="/checklist" element={<Navigate to="/app/checklist" replace />} />
                <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

                {/* Catch-all route */}
                <Route path="*" element={<Pages.NotFound />} />
              </Routes>
                </Suspense>
                  </ConfirmProvider>
                </SubscriptionProvider>
              </BrandThemeProvider>
            </TenantProvider>
          </AuthProvider>

          </BrowserRouter>
        </GlobalErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
