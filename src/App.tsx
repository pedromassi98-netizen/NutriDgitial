import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import WelcomeForm from "./pages/WelcomeForm";
import UserProfileForm from "./pages/UserProfileForm";
import UserActivityForm from "./pages/UserActivityForm";
import UserGoalsForm from "./pages/UserGoalsForm";
import DailyRoutineForm from "./pages/DailyRoutineForm";
import UserSupplementationForm from "./pages/UserSupplementationForm";
import UserFoodPreferencesForm from "./pages/UserFoodPreferencesForm";
import DietPlanPage from "./pages/DietPlanPage";
import NotFound from "./pages/NotFound";
import ProgressBar from "./components/ProgressBar"; // Importar ProgressBar

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const totalSteps = 7; // Total de telas de formulário antes da dieta final

  // Determine if the progress bar should be shown (e.g., not on 404 or welcome if it's just a landing)
  const showProgressBar = location.pathname !== "*" && location.pathname !== "/";

  return (
    <>
      {showProgressBar && <ProgressBar totalSteps={totalSteps} />}
      <Routes>
        <Route path="/" element={<WelcomeForm />} />
        <Route path="/profile" element={<UserProfileForm />} />
        <Route path="/activity" element={<UserActivityForm />} />
        <Route path="/goals" element={<UserGoalsForm />} />
        <Route path="/daily-routine" element={<DailyRoutineForm />} />
        <Route path="/supplementation" element={<UserSupplementationForm />} />
        <Route path="/food-preferences" element={<UserFoodPreferencesForm />} />
        <Route path="/diet-plan" element={<DietPlanPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;