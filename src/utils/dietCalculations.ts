import { z } from "zod";

// Esquemas de validação para os dados do formulário (para tipagem)
const welcomeFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
});

const userProfileFormSchema = z.object({
  weight: z.coerce.number(),
  age: z.coerce.number(),
  height: z.coerce.number(),
  gender: z.enum(["male", "female", "other"]),
});

const userActivityFormSchema = z.object({
  practicesPhysicalActivity: z.enum(["yes", "no"]),
  activityType: z.string().optional(), // This field is no longer directly used in the form, but kept for backward compatibility if needed elsewhere.
  doesCardio: z.enum(["yes", "no"]).optional(), // Not used in current form, but kept for backward compatibility
  cardioFrequency: z.coerce.number().optional(), // Not used in current form, but kept for backward compatibility
  trainingTime: z.enum(["morning", "afternoon", "night", "any"]).optional(), // Not used in current form, but kept for backward compatibility
  trainingLevel: z.enum(["sedentary", "light", "moderate", "intense", "very_intense"]).optional(),
});

const userGoalsFormSchema = z.object({
  goal: z.enum(["weight_loss", "muscle_gain", "maintenance", "healthy_eating"]),
});

const dailyRoutineFormSchema = z.object({
  wakeUpTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
  breakfastTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM).."),
  lunchTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
  snackTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."), // Removido .optional().or(z.literal(''))
  dinnerTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
  sleepTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
});

// Removido userSupplementationFormSchema

const userFoodPreferencesFormSchema = z.object({
  preferredBreakfastFoods: z.array(z.string()).optional(),
  preferredLunchFoods: z.array(z.string()).optional(),
  preferredSnackFoods: z.array(z.string()).min(1, "Por favor, selecione pelo menos um alimento para o lanche."), // Tornando obrigatório
  preferredDinnerFoods: z.array(z.string()).optional(),
  preferredFruits: z.array(z.string()).optional(), // Valor padrão
  preferredFats: z.array(z.string()).min(1, "Por favor, selecione pelo menos uma fonte de gordura saudável."), // NOVO CAMPO OBRIGATÓRIO
  dietaryRestrictions: z.string().optional(), // NOVO CAMPO: Restrições alimentares
});

export type WelcomeFormData = z.infer<typeof welcomeFormSchema>;
export type UserProfileFormData = z.infer<typeof userProfileFormSchema>;
export type UserActivityFormData = z.infer<typeof userActivityFormSchema>;
export type UserGoalsFormData = z.infer<typeof userGoalsFormSchema>;
export type DailyRoutineFormData = z.infer<typeof dailyRoutineFormSchema>;
// Removido export type UserSupplementationFormData
export type UserFoodPreferencesFormData = z.infer<typeof userFoodPreferencesFormSchema>;

export interface AllFormData {
  welcome?: WelcomeFormData;
  profile?: UserProfileFormData;
  activity?: UserActivityFormData;
  goals?: UserGoalsFormData;
  routine?: DailyRoutineFormData;
  // Removido supplementation?: UserSupplementationFormData;
  foodPreferences?: UserFoodPreferencesFormData;
}

// Funções de cálculo
export const calculateBMR = (weight: number, height: number, age: number, gender: "male" | "female" | "other"): number => {
  // Mifflin-St Jeor Equation
  if (gender === "male") {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else if (gender === "female") {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  } else {
    // For 'other' or unspecified, use an average or male formula as a fallback
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  }
};

export const calculateTDEE = (bmr: number, trainingLevel: UserActivityFormData['trainingLevel']): number => {
  let activityFactor = 1.2; // Sedentary default

  switch (trainingLevel) {
    case "sedentary":
      activityFactor = 1.2; // Sedentário (pouco ou nenhum exercício)
      break;
    case "light":
      activityFactor = 1.375; // Levemente Ativo (exercício leve 1-3 dias/semana)
      break;
    case "moderate":
      activityFactor = 1.55; // Moderadamente Ativo (exercício moderado 3-5 dias/semana)
      break;
    case "intense":
      activityFactor = 1.725; // Muito Ativo (exercício intenso 6-7 dias/semana)
      break;
    case "very_intense":
      activityFactor = 1.9; // Extremamente Ativo (exercício muito intenso, 2x ao dia)
      break;
    default:
      activityFactor = 1.2; // Fallback for undefined or 'no' activity
      break;
  }

  return bmr * activityFactor;
};

export const adjustCaloriesForGoal = (tdee: number, goal: UserGoalsFormData['goal']): number => {
  let adjustedCalories = tdee;
  switch (goal) {
    case "weight_loss":
      adjustedCalories = tdee - 500; // Aim for ~0.5kg/week loss
      break;
    case "muscle_gain":
      adjustedCalories = tdee + 300; // Aim for muscle gain
      break;
    case "maintenance":
    case "healthy_eating":
    default:
      adjustedCalories = tdee;
      break;
  }
  // Ensure a minimum calorie intake, e.g., 1200 for women, 1500 for men, or a general safe minimum
  // This prevents calorie targets from going too low, which can lead to health issues and macro calculation errors.
  return Math.max(1200, adjustedCalories); // Using a general safe minimum of 1200 kcal
};

export const calculateWaterIntake = (weight: number, trainingLevel: UserActivityFormData['trainingLevel']): number => {
  let mlPerKg = 35; // Default for light activity

  switch (trainingLevel) {
    case "sedentary":
      mlPerKg = 30;
      break;
    case "light":
      mlPerKg = 35;
      break;
    case "moderate":
      mlPerKg = 40;
      break;
    case "intense":
      mlPerKg = 45;
      break;
    case "very_intense":
      mlPerKg = 50;
      break;
    default:
      mlPerKg = 35; // Fallback if trainingLevel is undefined or 'no' activity
      break;
  }
  return weight * mlPerKg;
};

export const calculateMacronutrients = (
  targetCalories: number,
  goal: UserGoalsFormData['goal'],
  weight: number // User's weight in kg
) => {
  let proteinPercentage: number;
  let carbPercentage: number;
  let fatPercentage: number;

  switch (goal) {
    case "muscle_gain":
      proteinPercentage = 0.30; // 30% protein
      carbPercentage = 0.50;    // 50% carbs
      fatPercentage = 0.20;     // 20% fat
      break;
    case "weight_loss":
      proteinPercentage = 0.35; // 35% protein
      carbPercentage = 0.35;    // 35% carbs
      fatPercentage = 0.30;     // 30% fat
      break;
    case "maintenance":
    case "healthy_eating":
    default:
      proteinPercentage = 0.25; // 25% protein
      carbPercentage = 0.45;    // 45% carbs
      fatPercentage = 0.30;     // 30% fat
      break;
  }

  const proteinCalories = targetCalories * proteinPercentage;
  const carbCalories = targetCalories * carbPercentage;
  const fatCalories = targetCalories * fatPercentage;

  // 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal
  const proteinGrams = Math.round(proteinCalories / 4);
  const carbGrams = Math.round(carbCalories / 4);
  const fatGrams = Math.round(fatCalories / 9);

  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
  };
};

export interface MealItemDetails {
  food: string;
  quantity: string;
  substitutions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  time: string;
  name: string;
  items: MealItemDetails[];
  totalMealCalories: number;
  totalMealProtein: number;
  totalMealCarbs: number;
  totalMealFat: number;
}