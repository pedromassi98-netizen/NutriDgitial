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
  preferredBreakfastFoods: z.string().optional(),
  preferredLunchFoods: z.string().optional(),
  preferredSnackFoods: z.string().optional(),
  preferredDinnerFoods: z.string().optional(),
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
    case "bulking":
      proteinPercentage = 0.30; // 30% protein
      carbPercentage = 0.50;    // 50% carbs
      fatPercentage = 0.20;     // 20% fat
      break;
    case "weight_loss":
    case "cutting":
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