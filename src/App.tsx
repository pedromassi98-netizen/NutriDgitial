import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomeForm from "./pages/WelcomeForm";
import UserProfileForm from "./pages/UserProfileForm";
import UserActivityForm from "./pages/UserActivityForm";
import UserGoalsForm from "./pages/UserGoalsForm";
import DailyRoutineForm from "./pages/DailyRoutineForm";
import UserSupplementationForm from "./pages/UserSupplementationForm"; // Importar a nova tela de suplementação
import UserFoodPreferencesForm from "./pages/UserFoodPreferencesForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomeForm />} />
          <Route path="/profile" element={<UserProfileForm />} />
          <Route path="/activity" element={<UserActivityForm />} />
          <Route path="/goals" element={<UserGoalsForm />} />
          <Route path="/daily-routine" element={<DailyRoutineForm />} />
          <Route path="/supplementation" element={<UserSupplementationForm />} /> {/* Nova rota */}
          <Route path="/food-preferences" element={<UserFoodPreferencesForm />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;