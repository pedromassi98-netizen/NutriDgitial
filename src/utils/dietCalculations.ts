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
interface FoodItem {
  name: string;
  category: 'carb' | 'protein' | 'fat' | 'vegetable' | 'fruit';
  caloriesPerServing: number;
  proteinPerServing: number;
  carbPerServing: number;
  fatPerServing: number;
  servingSize: string; // e.g., "100g", "1 unidade"
  substitutions?: string[];
}

const sampleFoods: FoodItem[] = [
  // Carbs
  { name: "Arroz branco cozido", category: "carb", caloriesPerServing: 130, proteinPerServing: 3, carbPerServing: 30, fatPerServing: 0.5, servingSize: "120g", substitutions: ["Batata cozida (120g)", "Macarrão integral cozido (120g)", "Mandioca cozida (120g)"] },
  { name: "Batata doce cozida", category: "carb", caloriesPerServing: 86, proteinPerServing: 2, carbPerServing: 20, fatPerServing: 0.1, servingSize: "150g", substitutions: ["Arroz integral cozido (120g)", "Inhame cozido (150g)", "Pão integral (2 fatias)"] },
  { name: "Pão integral", category: "carb", caloriesPerServing: 80, proteinPerServing: 5, carbPerServing: 25, fatPerServing: 2, servingSize: "2 fatias", substitutions: ["Tapioca (50g)", "Pão francês (1 unidade)", "Cuscuz (100g)"] },
  { name: "Aveia", category: "carb", caloriesPerServing: 150, proteinPerServing: 5, carbPerServing: 25, fatPerServing: 3, servingSize: "40g", substitutions: ["Granola (40g)", "Cereal integral (40g)"] },
  { name: "Tapioca", category: "carb", caloriesPerServing: 140, proteinPerServing: 0.5, carbPerServing: 35, fatPerServing: 0.1, servingSize: "50g", substitutions: ["Pão francês (1 unidade)", "Pão de queijo (2 unidades)"] },
  // Proteins
  { name: "Peito de frango grelhado", category: "protein", caloriesPerServing: 165, proteinPerServing: 45, carbPerServing: 0, fatPerServing: 3, servingSize: "150g", substitutions: ["Filé de peixe grelhado (150g)", "Carne magra grelhada (120g)", "Ovos cozidos (3 unidades)"] },
  { name: "Ovos cozidos", category: "protein", caloriesPerServing: 78, proteinPerServing: 6, carbPerServing: 0.5, fatPerServing: 5, servingSize: "1 unidade", substitutions: ["Claras de ovo (2 unidades)", "Queijo cottage (50g)", "Ricota (50g)"] }, // Changed to 1 unit for easier calculation
  { name: "Feijão cozido", category: "protein", caloriesPerServing: 132, proteinPerServing: 9, carbPerServing: 25, fatPerServing: 0.5, servingSize: "150g", substitutions: ["Lentilha cozida (150g)", "Grão de bico cozido (150g)", "Ervilha (150g)"] },
  { name: "Iogurte natural", category: "protein", caloriesPerServing: 60, proteinPerServing: 10, carbPerServing: 10, fatPerServing: 0.5, servingSize: "200g", substitutions: ["Kefir (200g)", "Leite desnatado (250ml)", "Coalhada (200g)"] },
  { name: "Carne vermelha magra", category: "protein", caloriesPerServing: 200, proteinPerServing: 30, carbPerServing: 0, fatPerServing: 8, servingSize: "120g", substitutions: ["Salmão grelhado (100g)", "Atum em lata (120g)"] },
  // Fats (small amounts, often part of other foods)
  { name: "Azeite de oliva", category: "fat", caloriesPerServing: 90, proteinPerServing: 0, carbPerServing: 0, fatPerServing: 10, servingSize: "1 colher de sopa", substitutions: ["Óleo de coco (1 colher de sopa)", "Manteiga de amendoim (1 colher de sopa)"] },
  { name: "Abacate", category: "fat", caloriesPerServing: 80, proteinPerServing: 1, carbPerServing: 4, fatPerServing: 7, servingSize: "50g", substitutions: ["Castanhas (30g)", "Nozes (30g)"] },
  // Fruits
  { name: "Banana", category: "fruit", caloriesPerServing: 105, proteinPerServing: 1, carbPerServing: 27, fatPerServing: 0.3, servingSize: "1 unidade", substitutions: ["Maçã (1 unidade)", "Pera (1 unidade)", "Laranja (1 unidade)"] },
  { name: "Maçã", category: "fruit", caloriesPerServing: 95, proteinPerServing: 0.5, carbPerServing: 25, fatPerServing: 0.3, servingSize: "1 unidade", substitutions: ["Banana (1 unidade)", "Pera (1 unidade)", "Manga (100g)"] },
  // Vegetables (usually "à vontade" and low calorie)
  { name: "Salada mista", category: "vegetable", caloriesPerServing: 20, proteinPerServing: 1, carbPerServing: 5, fatPerServing: 0.1, servingSize: "à vontade", substitutions: ["Brócolis cozido", "Cenoura ralada", "Couve refogada"] },
  { name: "Vegetais cozidos", category: "vegetable", caloriesPerServing: 30, proteinPerServing: 2, carbPerServing: 7, fatPerServing: 0.2, servingSize: "à vontade", substitutions: ["Espinafre", "Abobrinha", "Berinjela"] },
];

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

export const generateMealPlan = (
  totalCalories: number,
  routine: DailyRoutineFormData,
  foodPreferences: UserFoodPreferencesFormData,
  dietaryRestrictions: string
): Meal[] => {
  const meals: Meal[] = [];
  const mealDistribution = {
    breakfast: 0.18,
    snack1: 0.08,
    lunch: 0.28,
    snack2: 0.08,
    dinner: 0.28,
    supper: 0.10,
  };

  const parseTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const addHours = (date: Date, hours: number): Date => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  };

  const wakeUp = parseTime(routine.wakeUpTime);
  const breakfast = parseTime(routine.breakfastTime);
  const lunch = parseTime(routine.lunchTime);
  const dinner = parseTime(routine.dinnerTime);
  const sleep = parseTime(routine.sleepTime);

  // Determine snack and supper times based on intervals
  let snack1Time = addHours(breakfast, 3);
  if (snack1Time.getTime() >= lunch.getTime()) {
    snack1Time = new Date(0); // Mark as invalid/skipped
  }

  let snack2Time = addHours(lunch, 3);
  if (snack2Time.getTime() >= dinner.getTime()) {
    snack2Time = new Date(0); // Mark as invalid/skipped
  }

  let supperTime = addHours(dinner, 3);
  // Ensure supper is before sleep and not too close to dinner if dinner is late
  if (supperTime.getTime() >= sleep.getTime() || (supperTime.getTime() - dinner.getTime() < 2 * 60 * 60 * 1000)) {
    supperTime = new Date(0); // Mark as invalid/skipped
  }


  const mealTimes = [
    { name: "Café da Manhã", time: breakfast, percentage: mealDistribution.breakfast },
    { name: "Lanche da Manhã", time: snack1Time, percentage: mealDistribution.snack1, optional: true },
    { name: "Almoço", time: lunch, percentage: mealDistribution.lunch },
    { name: "Lanche da Tarde", time: snack2Time, percentage: mealDistribution.snack2, optional: true },
    { name: "Jantar", time: dinner, percentage: mealDistribution.dinner },
    { name: "Ceia", time: supperTime, percentage: mealDistribution.supper, optional: true },
  ].filter(meal => !meal.optional || meal.time.getTime() !== new Date(0).getTime());

  // Adjust percentages if optional meals are skipped
  let currentTotalPercentage = mealTimes.reduce((sum, meal) => sum + meal.percentage, 0);
  if (currentTotalPercentage < 1) {
    const remainingPercentage = 1 - currentTotalPercentage;
    const baseMealsCount = mealTimes.filter(m => !m.optional).length;
    const additionalPerBaseMeal = remainingPercentage / baseMealsCount;
    mealTimes.forEach(meal => {
      if (!meal.optional) {
        meal.percentage += additionalPerBaseMeal;
      }
    });
  }


  const getPreferredFoods = (category: 'carb' | 'protein' | 'vegetable' | 'fruit' | 'fat', preferences: string | undefined) => {
    const allCategoryFoods = sampleFoods.filter(food => food.category === category);
    let filteredFoods = allCategoryFoods.filter(food =>
      !dietaryRestrictions.toLowerCase().includes(food.name.toLowerCase())
    );

    if (preferences) {
      const preferredList = preferences.split(',').map(p => p.trim().toLowerCase());
      const preferredAndAllowed = filteredFoods.filter(food =>
        preferredList.some(pref => food.name.toLowerCase().includes(pref))
      );
      if (preferredAndAllowed.length > 0) {
        return preferredAndAllowed;
      }
    }
    return filteredFoods; // Fallback to all allowed foods of the category
  };

  const getRandomFood = (category: 'carb' | 'protein' | 'fat' | 'vegetable' | 'fruit', preferences: string | undefined) => {
    const availableFoods = getPreferredFoods(category, preferences);
    if (availableFoods.length === 0) {
      return undefined; // No suitable food found
    }
    return availableFoods[Math.floor(Math.random() * availableFoods.length)];
  };

  mealTimes.forEach(mealInfo => {
    const mealCaloriesTarget = Math.round(totalCalories * mealInfo.percentage);
    const mealItems: MealItemDetails[] = [];
    let currentMealCalories = 0;
    let currentMealProtein = 0;
    let currentMealCarbs = 0;
    let currentMealFat = 0;

    const addFoodItem = (food: FoodItem, targetCalories: number, isMainComponent: boolean = false) => {
      if (!food) return;

      let servings = 1;
      if (food.caloriesPerServing > 0) {
        if (isMainComponent) {
          servings = Math.max(1, Math.round(targetCalories / food.caloriesPerServing));
        } else {
          // For smaller components, try to fit within remaining calories or just add 1 serving
          servings = Math.max(1, Math.round(targetCalories / food.caloriesPerServing));
          if (servings * food.caloriesPerServing > mealCaloriesTarget - currentMealCalories && mealCaloriesTarget - currentMealCalories > 0) {
            servings = Math.max(1, Math.floor((mealCaloriesTarget - currentMealCalories) / food.caloriesPerServing));
          }
        }
      }
      
      if (servings === 0 && isMainComponent) servings = 1; // Ensure at least one serving for main components

      if (servings > 0) {
        const quantityValue = parseInt(food.servingSize.replace('g', '').replace('unidade', '1').replace('fatias', '1'));
        const unit = food.servingSize.includes('g') ? 'g' : (food.servingSize.includes('unidade') || food.servingSize.includes('fatias') ? ' unidades' : '');
        
        mealItems.push({
          food: food.name,
          quantity: `${servings * quantityValue}${unit}`,
          substitutions: food.substitutions || [],
          calories: servings * food.caloriesPerServing,
          protein: servings * food.proteinPerServing,
          carbs: servings * food.carbPerServing,
          fat: servings * food.fatPerServing,
        });
        currentMealCalories += servings * food.caloriesPerServing;
        currentMealProtein += servings * food.proteinPerServing;
        currentMealCarbs += servings * food.carbPerServing;
        currentMealFat += servings * food.fatPerServing;
      }
    };

    // Prioritize protein and carb for main meals
    if (["Café da Manhã", "Almoço", "Jantar", "Ceia"].includes(mealInfo.name)) {
      // Protein
      const protein = getRandomFood('protein', foodPreferences.preferredProteins);
      if (protein) {
        addFoodItem(protein, mealCaloriesTarget * 0.3, true); // ~30% from protein
      }

      // Carb
      const carb = getRandomFood('carb', foodPreferences.preferredCarbs);
      if (carb) {
        addFoodItem(carb, mealCaloriesTarget * 0.4, true); // ~40% from carb
      }

      // Vegetables for main meals (usually "à vontade")
      if (["Almoço", "Jantar"].includes(mealInfo.name)) {
        const vegetable = getRandomFood('vegetable', foodPreferences.preferredVegetables);
        if (vegetable) {
          addFoodItem(vegetable, 50); // Small fixed calories for "à vontade"
        }
      }

      // Add a small amount of healthy fat
      const fat = getRandomFood('fat', undefined);
      if (fat && Math.random() > 0.5) { // Randomly add fat
        addFoodItem(fat, 90); // 1 serving of fat
      }

    } else { // Snacks
      const snackOption = Math.random() > 0.5 ? getRandomFood('carb', foodPreferences.preferredCarbs) : getRandomFood('protein', foodPreferences.preferredProteins);
      if (snackOption) {
        addFoodItem(snackOption, mealCaloriesTarget * 0.7, true);
      }
      const fruit = getRandomFood('fruit', foodPreferences.preferredFruits);
      if (fruit && Math.random() > 0.5) { // Add fruit to some snacks
        addFoodItem(fruit, mealCaloriesTarget * 0.3);
      }
    }

    meals.push({
      time: formatTime(mealInfo.time),
      name: mealInfo.name,
      items: mealItems,
      totalMealCalories: Math.round(currentMealCalories),
      totalMealProtein: Math.round(currentMealProtein),
      totalMealCarbs: Math.round(currentMealCarbs),
      totalMealFat: Math.round(currentMealFat),
    });
  });

  return meals;
};