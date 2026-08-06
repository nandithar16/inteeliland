import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { DetailedLandParcelAnalysis } from "@/components/screens/detailed-land-parcel-analysis"; // ✅ named import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Notification Components */}
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>
          {/* 🏠 Main Landing Page */}
          <Route path="/" element={<Index />} />

          {/* 📍 Detailed Land Parcel Page */}
          {/* 
            Note: The DetailedLandParcelAnalysis component must have its props 
            defined as optional (parcelId?: string; onBack?: () => void;) 
            inside detailed-land-parcel-analysis.tsx.
            It will receive navigation state from Index.tsx.
          */}
          <Route path="/detailed-land-parcel" element={<DetailedLandParcelAnalysis />} />

          {/* 🚫 Catch-all Route (404) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
