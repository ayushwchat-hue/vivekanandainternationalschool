import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admission from "./pages/Admission";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminContent from "./pages/admin/AdminContent";
import AdminGallery from "./pages/admin/AdminGallery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/admission" element={<Admission />} />
          
          {/* Admin Routes (No Auth Required) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/inquiries" element={<AdminInquiries />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;