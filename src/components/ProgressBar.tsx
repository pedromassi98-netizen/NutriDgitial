import React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  totalSteps: number;
}

const routeToStepMap: { [key: string]: number } = {
  "/profile": 1, // Perfil agora é o passo 1
  "/activity": 2,
  "/goals": 3,
  "/daily-routine": 4,
  // "/supplementation": 5, // Removido
  "/food-preferences": 5, // Preferências alimentares agora é o passo 5
  "/diet-plan": 6, // Diet Plan agora é o passo 6
};

const ProgressBar = ({ totalSteps }: ProgressBarProps) => {
  const location = useLocation();
  const currentStep = routeToStepMap[location.pathname] || 0; // Se não houver rota correspondente, não mostra progresso

  if (currentStep === 0) return null; // Não renderiza a barra de progresso na tela inicial de boas-vindas

  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-4 p-4">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div
            key={stepNumber}
            className={cn(
              "relative flex items-center justify-center size-8 rounded-full border-2 transition-colors duration-300",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-gray-300 bg-gray-100 text-gray-500",
              isCurrent && "shadow-md"
            )}
          >
            <span className="font-bold text-sm">{stepNumber}</span>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "absolute left-full w-4 sm:w-8 h-0.5 transition-colors duration-300",
                  isActive ? "bg-primary" : "bg-gray-300"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressBar;