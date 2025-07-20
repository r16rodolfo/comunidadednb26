import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Planner from "./pages/Planner";
import Academy from "./pages/Academy";
import Achadinhos from "./pages/Achadinhos";
import AchadinhosPub from "./pages/AchadinhosPub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/academy" element={<Academy />} />
          {/* Placeholder routes for other pages */}
          <Route path="/objetivos" element={<Index />} />
          <Route path="/analise" element={<Index />} />
          <Route path="/achadinhos" element={<Achadinhos />} />
          <Route path="/produtos" element={<AchadinhosPub />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
