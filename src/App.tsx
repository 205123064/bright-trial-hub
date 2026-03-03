import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TrialProvider } from "@/context/TrialContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import Index from "./pages/Index";
import CreateTrial from "./pages/CreateTrial";
import TrialDetails from "./pages/TrialDetails";
import PatientDetail from "./pages/PatientDetail";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TrialProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/create-trial" element={<CreateTrial />} />
              <Route path="/trial/:id" element={<TrialDetails />} />
              <Route path="/trial/:id/patient/:patientId" element={<PatientDetail />} />
              
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TrialProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
