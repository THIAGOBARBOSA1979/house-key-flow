
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Admin pages and layout
import { AppLayout } from "./components/Layout/AppLayout";
import AdminDocuments from "./pages/admin/Documents";
import DesignSystem from "./pages/admin/DesignSystem";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import Inspections from "./pages/Inspections";
import Warranty from "./pages/Warranty";
import Calendar from "./pages/Calendar";
import Users from "./pages/Users";
import ClientArea from "./pages/ClientArea";
import Checklist from "./pages/Checklist";
import Settings from "./pages/Settings";
import AuditLogs from "./pages/admin/AuditLogs";
import FinancialDashboard from "./pages/admin/FinancialDashboard";
import Announcements from "./pages/admin/Announcements";
import Technicians from "./pages/Technicians";
import AdminSupport from "./pages/admin/Support";

// Client pages and layout
import ClientLayout from "./components/Layout/ClientLayout";
import ClientDashboard from "./pages/client/Dashboard";
import ClientDocuments from "./pages/client/Documents";
import ClientInspections from "./pages/client/Inspections";
import ClientWarranty from "./pages/client/Warranty";
import ClientProperties from "./pages/client/Properties";
import ClientNotifications from "./pages/client/Notifications";
import ClientProfile from "./pages/client/Profile";
import ClientFinancial from "./pages/client/Financial";
import ClientSupport from "./pages/client/Support";

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
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              
              {/* Redirect legacy login paths */}
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />
              <Route path="/client/login" element={<Navigate to="/login" replace />} />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout><Index /></AppLayout>
                </ProtectedRoute>
              }>
                <Route index element={<Index />} />
              </Route>
              
              <Route path="/admin/properties" element={<ProtectedRoute requiredRole="admin"><AppLayout><Properties /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/inspections" element={<ProtectedRoute requiredRole="admin"><AppLayout><Inspections /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/warranty" element={<ProtectedRoute requiredRole="admin"><AppLayout><Warranty /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/documents" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminDocuments /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/calendar" element={<ProtectedRoute requiredRole="admin"><AppLayout><Calendar /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AppLayout><Users /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/client-area" element={<ProtectedRoute requiredRole="admin"><AppLayout><ClientArea /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/checklist" element={<ProtectedRoute requiredRole="admin"><AppLayout><Checklist /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/design-system" element={<ProtectedRoute requiredRole="admin"><AppLayout><DesignSystem /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute requiredRole="admin"><AppLayout><AuditLogs /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/financial" element={<ProtectedRoute requiredRole="admin"><AppLayout><FinancialDashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/announcements" element={<ProtectedRoute requiredRole="admin"><AppLayout><Announcements /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/technicians" element={<ProtectedRoute requiredRole="admin"><AppLayout><Technicians /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/support" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminSupport /></AppLayout></ProtectedRoute>} />

              {/* Protected Client Routes */}
              <Route path="/client" element={
                <ProtectedRoute requiredRole="client">
                  <ClientLayout />
                </ProtectedRoute>
              }>
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
