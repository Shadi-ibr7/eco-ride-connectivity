import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmployeeAuth from "./pages/EmployeeAuth";
import AdminAuth from "./pages/AdminAuth";
import Profile from "./pages/Profile";
import HowItWorks from "./pages/HowItWorks";
import Rides from "./pages/Rides";
import RideDetails from "./pages/RideDetails";
import Contact from "./pages/Contact";
import Employee from "./pages/Employee";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/employee/auth" element={<EmployeeAuth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/rides/:id" element={<RideDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;