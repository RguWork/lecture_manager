import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import WeeklySchedule from "./pages/WeeklySchedule";
import ImportTimetable from "./pages/ImportTimetable";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Login from "@/pages/Login";

const queryClient = new QueryClient();

const App = () => {

  return(
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><WeeklySchedule /></ProtectedRoute>} />
            <Route path="/import" element={<ProtectedRoute><ImportTimetable /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  )
  
};

export default App;
