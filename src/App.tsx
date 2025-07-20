
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/auth";

// Pages
import Index from "./pages/Index";
import Planner from "./pages/Planner";
import Academy from "./pages/Academy";
import Achadinhos from "./pages/Achadinhos";
import AchadinhosPub from "./pages/AchadinhosPub";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import AdminSettings from "./pages/admin/Settings";
import ManagerDashboard from "./pages/manager/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/produtos" element={<AchadinhosPub />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/planner" element={
              <ProtectedRoute>
                <Planner />
              </ProtectedRoute>
            } />
            
            <Route path="/academy" element={
              <ProtectedRoute>
                <Academy />
              </ProtectedRoute>
            } />
            
            <Route path="/achadinhos" element={
              <ProtectedRoute>
                <Achadinhos />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            
            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={
              <ProtectedRoute requiredRole={UserRole.MANAGER}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Placeholder routes for other pages */}
            <Route path="/objetivos" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/analise" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
