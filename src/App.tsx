
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { BrandThemeProvider } from "@/components/Shared/BrandThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";


import { lazy, Suspense } from "react";
import { SkeletonLoader } from "./components/Shared/SkeletonLoader";

import * as Pages from "./routes/pages";


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
              <ConfirmProvider>
                <BrandThemeProvider>

                <Suspense fallback={<SkeletonLoader type="page" />}>
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Pages.Home />} />
                <Route path="/login" element={<Pages.Login />} />
                <Route path="/forgot-password" element={<Pages.ForgotPassword />} />
                
                {/* Redirect legacy login paths */}
                <Route path="/admin/login" element={<Navigate to="/login" replace />} />
                <Route path="/client/login" element={<Navigate to="/login" replace />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute requiredRole={['admin', 'super_admin']}><Pages.AppLayout /></ProtectedRoute>}>
                  <Route index element={<Pages.AdminIndex />} />
                  <Route path="properties" element={<Pages.Properties />} />
                  <Route path="inspections" element={<Pages.Inspections />} />
                  <Route path="warranty" element={<Pages.Warranty />} />
                  <Route path="documents" element={<Pages.AdminDocuments />} />
                  <Route path="calendar" element={<Pages.Calendar />} />
                  <Route path="users" element={<Pages.Users />} />
                  <Route path="client-area" element={<Pages.ClientArea />} />
                  <Route path="checklist" element={<Pages.Checklist />} />
                  <Route path="settings" element={<Pages.Settings />} />
                  <Route path="design-system" element={<Pages.DesignSystem />} />
                  <Route path="audit-logs" element={<Pages.AuditLogs />} />
                  
                  <Route path="announcements" element={<Pages.Announcements />} />
                  <Route path="technicians" element={<Pages.Technicians />} />
                  <Route path="support" element={<Pages.AdminSupport />} />
                  <Route path="saas" element={<ProtectedRoute requiredRole="super_admin"><Pages.SaaSAdmin /></ProtectedRoute>} />
                </Route>



                {/* Protected Client Routes */}
                <Route path="/client" element={<ProtectedRoute requiredRole={['user', 'admin', 'super_admin']}><Pages.ClientLayout /></ProtectedRoute>}>
                  <Route index element={<Pages.ClientDashboard />} />
                  <Route path="documents" element={<Pages.ClientDocuments />} />
                  <Route path="inspections" element={<Pages.ClientInspections />} />
                  <Route path="warranty" element={<Pages.ClientWarranty />} />
                  <Route path="properties" element={<Pages.ClientProperties />} />
                  <Route path="notifications" element={<Pages.ClientNotifications />} />
                  <Route path="profile" element={<Pages.ClientProfile />} />
                  
                  <Route path="support" element={<Pages.ClientSupport />} />
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
                <Route path="*" element={<Pages.NotFound />} />
              </Routes>
                </Suspense>
                </BrandThemeProvider>
              </ConfirmProvider>
            </AuthProvider>

          </BrowserRouter>
        </GlobalErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
