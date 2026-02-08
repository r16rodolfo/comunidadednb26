
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
import DnbAnalysis from "./pages/DnbAnalysis";
import Coupons from "./pages/Coupons";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminContent from "./pages/admin/Content";
import AdminCoupons from "./pages/admin/Coupons";
import AdminAnalytics from "./pages/admin/Analytics";
import Subscription from "./pages/Subscription";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminPlanner from "./pages/admin/Planner";
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
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/content" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminContent />
              </ProtectedRoute>
            } />
            <Route path="/admin/coupons" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminCoupons />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminAnalytics />
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
            <Route path="/admin/planner" element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminPlanner />
              </ProtectedRoute>
            } />
            
            <Route path="/analise" element={
              <ProtectedRoute>
                <DnbAnalysis />
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
