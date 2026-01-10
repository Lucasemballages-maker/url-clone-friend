import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MyApps from "./pages/MyApps";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import ShopifyFinalization from "./pages/ShopifyFinalization";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import ShopifyApp from "./pages/ShopifyApp";
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
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/apps" element={<MyApps />} />
            <Route path="/dashboard/shopify" element={<ShopifyApp />} />
            <Route path="/dashboard/help" element={<Help />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/shopify-finalization" element={<ShopifyFinalization />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
