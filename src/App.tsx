import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admission from "./pages/Admission";
import AdminLogin from "./pages/AdminLogin";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminContent from "./pages/admin/AdminContent";
import AdminGallery from "./pages/admin/AdminGallery";

const queryClient = new QueryClient();

// Protected route component for admin
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/admission" element={<Admission />} />
            
            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>
            } />
            <Route path="/admin/inquiries" element={
              <ProtectedAdminRoute><AdminInquiries /></ProtectedAdminRoute>
            } />
            <Route path="/admin/content" element={
              <ProtectedAdminRoute><AdminContent /></ProtectedAdminRoute>
            } />
            <Route path="/admin/gallery" element={
              <ProtectedAdminRoute><AdminGallery /></ProtectedAdminRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;