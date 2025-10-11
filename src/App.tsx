import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomeForm from "./pages/WelcomeForm"; // Importar a nova tela de boas-vindas
import UserProfileForm from "./pages/UserProfileForm";
import UserActivityForm from "./pages/UserActivityForm"; // Importar a nova tela de atividade física
import UserGoalsForm from "./pages/UserGoalsForm";
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
          <Route path="/" element={<WelcomeForm />} /> {/* Nova tela inicial */}
          <Route path="/profile" element={<UserProfileForm />} /> {/* Antiga tela inicial */}
          <Route path="/activity" element={<UserActivityForm />} /> {/* Nova tela de atividade física */}
          <Route path="/goals" element={<UserGoalsForm />} />
          <Route path="/food-preferences" element={<UserFoodPreferencesForm />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;