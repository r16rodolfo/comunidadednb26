
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
import TravelPlanner from "./pages/TravelPlanner";
import Academy from "./pages/Academy";
import DnbAnalysis from "./pages/DnbAnalysis";
import Coupons from "./pages/Coupons";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import AdminSettings from "./pages/admin/Settings";
import ManagerDashboard from "./pages/manager/Dashboard";
import Users from "./pages/manager/Users";
import Content from "./pages/manager/Content";
import ManagerCoupons from "./pages/manager/Coupons";
import Analytics from "./pages/manager/Analytics";
import Subscription from "./pages/Subscription";
import AdminSubscriptions from "./pages/admin/Subscriptions";
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
            
            
            <Route path="/coupons" element={
              <ProtectedRoute>
                <Coupons />
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
            <Route path="/manager/users" element={
              <ProtectedRoute requiredRole={UserRole.MANAGER}>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/manager/content" element={
              <ProtectedRoute requiredRole={UserRole.MANAGER}>
                <Content />
              </ProtectedRoute>
            } />
            <Route path="/manager/coupons" element={
              <ProtectedRoute requiredRole={UserRole.MANAGER}>
                <ManagerCoupons />
              </ProtectedRoute>
            } />
            <Route path="/manager/analytics" element={
              <ProtectedRoute requiredRole={UserRole.MANAGER}>
                <Analytics />
              </ProtectedRoute>
            } />
            
            {/* Subscription Routes */}
            <Route path="/subscription" element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/admin/subscriptions" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminSubscriptions />
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
                <DnbAnalysis />
              </ProtectedRoute>
            } />
            
            <Route path="/agencia" element={
              <ProtectedRoute>
                <TravelPlanner />
              </ProtectedRoute>
            } />
            
            <Route path="/agencia/:module" element={
              <ProtectedRoute>
                <TravelPlanner />
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
