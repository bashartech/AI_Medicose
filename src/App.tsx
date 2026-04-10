import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import UploadImage from "./pages/UploadImage";
import UploadReport from "./pages/UploadReport";
import AnalysisResults from "./pages/AnalysisResults";
import BloodPressureEstimation from "./pages/BloodPressureEstimation";
import EyeScanNeurological from "./pages/EyeScanNeurological";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/upload-image" element={<UploadImage />} />
          <Route path="/upload-report" element={<UploadReport />} />
          <Route path="/analysis/:type/:id" element={<AnalysisResults />} />
          <Route path="/bp-estimation" element={<BloodPressureEstimation />} />
          <Route path="/eye-scan" element={<EyeScanNeurological />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
