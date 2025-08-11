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


//ping test
import { useEffect } from "react";
import { ping } from "@/lib/ping";


//------

const queryClient = new QueryClient();

const App = () => {

  useEffect(() => {
    ping().then(console.log).catch(console.error);
  }, []);

  return(
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<WeeklySchedule />} />
            <Route path="/import" element={<ImportTimetable />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  )
  
};

export default App;
