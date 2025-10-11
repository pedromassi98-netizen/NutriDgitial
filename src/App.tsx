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
import UserSupplementationForm from "./pages/UserSupplementationForm";
import UserFoodPreferencesForm from "./pages/UserFoodPreferencesForm";
import DietPlanPage from "./pages/DietPlanPage"; // Importar a nova tela de dieta
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
          <Route path="/supplementation" element={<UserSupplementationForm />} />
          <Route path="/food-preferences" element={<UserFoodPreferencesForm />} />
          <Route path="/diet-plan" element={<DietPlanPage />} /> {/* Nova rota para a dieta */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;