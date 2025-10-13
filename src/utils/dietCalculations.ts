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
  activityType: z.string().optional(),
  doesCardio: z.enum(["yes", "no"]).optional(),
  cardioFrequency: z.coerce.number().optional(),
  trainingTime: z.enum(["morning", "afternoon", "night", "any"]).optional(),
  trainingLevel: z.enum(["sedentary", "light", "moderate", "intense", "very_intense"]).optional(),
});

const userGoalsFormSchema = z.object({
  goal: z.enum(["weight_loss", "muscle_gain", "maintenance", "bulking", "cutting", "healthy_eating"]),
});

const dailyRoutineFormSchema = z.object({
  wakeUpTime: z.string(),
  breakfastTime: z.string(),
  lunchTime: z.string(),
  snackTime: z.string().optional(),
  dinnerTime: z.string(),
  sleepTime: z.string(),
});

const userSupplementationFormSchema = z.object({
  usesSupplements: z.enum(["yes", "no"]),
  currentSupplements: z.array(z.string()).optional(),
  wantsToToUseSupplements: z.enum(["yes", "no"]).optional(),
  supplementationGoals: z.array(z.string()).optional(),
  otherSupplementationGoals: z.string().optional(),
});

const userFoodPreferencesFormSchema = z.object({
  preferredCarbs: z.string().optional(),
  preferredProteins: z.string().optional(),
  preferredVegetables: z.string().optional(),
  preferredFruits: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
});

export type WelcomeFormData = z.infer<typeof welcomeFormSchema>;
export type UserProfileFormData = z.infer<typeof userProfileFormSchema>;
export type UserActivityFormData = z.infer<typeof userActivityFormSchema>;
export type UserGoalsFormData = z.infer<typeof userGoalsFormSchema>;
export type DailyRoutineFormData = z.infer<typeof dailyRoutineFormSchema>;
export type UserSupplementationFormData = z.infer<typeof userSupplementationFormSchema>;
export type UserFoodPreferencesFormData = z.infer<typeof userFoodPreferencesFormSchema>;

export interface AllFormData {
  welcome?: WelcomeFormData;
  profile?: UserProfileFormData;
  activity?: UserActivityFormData;
  goals?: UserGoalsFormData;
  routine?: DailyRoutineFormData;
  supplementation?: UserSupplementationFormData;
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
      activityFactor = 1.2;
      break;
    case "light":
      activityFactor = 1.375;
      break;
    case "moderate":
      activityFactor = 1.55;
      break;
    case "intense":
      activityFactor = 1.725;
      break;
    case "very_intense":
      activityFactor = 1.9;
      break;
    default:
      activityFactor = 1.2; // Fallback for undefined or 'no' activity
      break;
  }

  return bmr * activityFactor;
};

export const adjustCaloriesForGoal = (tdee: number, goal: UserGoalsFormData['goal']): number => {
  switch (goal) {
    case "weight_loss":
    case "cutting":
      return tdee - 500; // Aim for ~0.5kg/week loss
    case "muscle_gain":
    case "bulking":
      return tdee + 300; // Aim for muscle gain
    case "maintenance":
    case "healthy_eating":
    default:
      return tdee;
  }
};

export const calculateWaterIntake = (weight: number): number => {
  return weight * 35; // 35ml per kg of body weight
};

// Definição de alimentos e substituições com macronutrientes
// REMOVED: sampleFoods as it's no longer used for dynamic meal generation.

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

// REMOVED: generateMealPlan as it's no longer used for dynamic meal generation.