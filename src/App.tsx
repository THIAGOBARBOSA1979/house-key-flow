
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
              <BrandThemeProvider>
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
                <Route path="/admin" element={<ProtectedRoute requiredRole={['admin', 'super_admin']}><AppLayout /></ProtectedRoute>}>
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
                  <Route path="saas" element={<ProtectedRoute requiredRole="super_admin"><SaaSAdmin /></ProtectedRoute>} />
                </Route>


                {/* Protected Client Routes */}
                <Route path="/client" element={<ProtectedRoute requiredRole={['user', 'admin', 'super_admin']}><ClientLayout /></ProtectedRoute>}>
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
              </BrandThemeProvider>
            </AuthProvider>
          </BrowserRouter>
        </GlobalErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
