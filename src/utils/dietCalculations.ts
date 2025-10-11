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

// Definição de alimentos e substituições
interface FoodItem {
  name: string;
  category: 'carb' | 'protein' | 'fat' | 'vegetable' | 'fruit';
  caloriesPerServing: number;
  servingSize: string; // e.g., "100g", "1 unidade"
  substitutions?: string[];
}

const sampleFoods: FoodItem[] = [
  // Carbs
  { name: "Arroz branco cozido", category: "carb", caloriesPerServing: 130, servingSize: "120g", substitutions: ["Batata cozida (120g)", "Macarrão integral cozido (120g)", "Mandioca cozida (120g)"] },
  { name: "Batata doce cozida", category: "carb", caloriesPerServing: 86, servingSize: "150g", substitutions: ["Arroz integral cozido (120g)", "Inhame cozido (150g)", "Pão integral (2 fatias)"] },
  { name: "Pão integral", category: "carb", caloriesPerServing: 80, servingSize: "2 fatias", substitutions: ["Tapioca (50g)", "Pão francês (1 unidade)", "Cuscuz (100g)"] },
  { name: "Aveia", category: "carb", caloriesPerServing: 150, servingSize: "40g", substitutions: ["Granola (40g)", "Cereal integral (40g)"] },
  { name: "Tapioca", category: "carb", caloriesPerServing: 140, servingSize: "50g", substitutions: ["Pão francês (1 unidade)", "Pão de queijo (2 unidades)"] },
  // Proteins
  { name: "Peito de frango grelhado", category: "protein", caloriesPerServing: 165, servingSize: "150g", substitutions: ["Filé de peixe grelhado (150g)", "Carne magra grelhada (120g)", "Ovos cozidos (3 unidades)"] },
  { name: "Ovos cozidos", category: "protein", caloriesPerServing: 78, servingSize: "2 unidades", substitutions: ["Claras de ovo (4 unidades)", "Queijo cottage (100g)", "Ricota (100g)"] },
  { name: "Feijão cozido", category: "protein", caloriesPerServing: 132, servingSize: "150g", substitutions: ["Lentilha cozida (150g)", "Grão de bico cozido (150g)", "Ervilha (150g)"] },
  { name: "Iogurte natural", category: "protein", caloriesPerServing: 60, servingSize: "200g", substitutions: ["Kefir (200g)", "Leite desnatado (250ml)", "Coalhada (200g)"] },
  { name: "Carne vermelha magra", category: "protein", caloriesPerServing: 200, servingSize: "120g", substitutions: ["Salmão grelhado (100g)", "Atum em lata (120g)"] },
  // Fats (small amounts, often part of other foods)
  { name: "Azeite de oliva", category: "fat", caloriesPerServing: 90, servingSize: "1 colher de sopa", substitutions: ["Óleo de coco (1 colher de sopa)", "Manteiga de amendoim (1 colher de sopa)"] },
  { name: "Abacate", category: "fat", caloriesPerServing: 160, servingSize: "50g", substitutions: ["Castanhas (30g)", "Nozes (30g)"] },
  // Fruits
  { name: "Banana", category: "fruit", caloriesPerServing: 105, servingSize: "1 unidade", substitutions: ["Maçã (1 unidade)", "Pera (1 unidade)", "Laranja (1 unidade)"] },
  { name: "Maçã", category: "fruit", caloriesPerServing: 95, servingSize: "1 unidade", substitutions: ["Banana (1 unidade)", "Pera (1 unidade)", "Manga (100g)"] },
  // Vegetables (usually "à vontade" and low calorie)
  { name: "Salada mista", category: "vegetable", caloriesPerServing: 20, servingSize: "à vontade", substitutions: ["Brócolis cozido", "Cenoura ralada", "Couve refogada"] },
  { name: "Vegetais cozidos", category: "vegetable", caloriesPerServing: 30, servingSize: "à vontade", substitutions: ["Espinafre", "Abobrinha", "Berinjela"] },
];

export interface Meal {
  time: string;
  name: string;
  items: { food: string; quantity: string; substitutions: string[] }[];
}

export const generateMealPlan = (
  totalCalories: number,
  routine: DailyRoutineFormData,
  foodPreferences: UserFoodPreferencesFormData,
  dietaryRestrictions: string
): Meal[] => {
  const meals: Meal[] = [];
  const mealDistribution = {
    breakfast: 0.20,
    snack1: 0.10,
    lunch: 0.30,
    snack2: 0.10,
    dinner: 0.30,
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

  // Determine snack times based on intervals
  let snack1Time = addHours(breakfast, 3);
  if (snack1Time.getTime() >= lunch.getTime()) { // If snack1 is too close to lunch, skip or adjust
    snack1Time = new Date(0); // Mark as invalid/skipped
  }

  let snack2Time = addHours(lunch, 3);
  if (snack2Time.getTime() >= dinner.getTime()) { // If snack2 is too close to dinner, skip or adjust
    snack2Time = new Date(0); // Mark as invalid/skipped
  }

  const mealTimes = [
    { name: "Café da Manhã", time: breakfast, percentage: mealDistribution.breakfast },
    { name: "Lanche da Manhã", time: snack1Time, percentage: mealDistribution.snack1, optional: true },
    { name: "Almoço", time: lunch, percentage: mealDistribution.lunch },
    { name: "Lanche da Tarde", time: snack2Time, percentage: mealDistribution.snack2, optional: true },
    { name: "Jantar", time: dinner, percentage: mealDistribution.dinner },
  ].filter(meal => !meal.optional || meal.time.getTime() !== new Date(0).getTime()); // Filter out skipped optional snacks

  // Adjust percentages if snacks are skipped
  let totalPercentage = mealTimes.reduce((sum, meal) => sum + meal.percentage, 0);
  if (totalPercentage < 1) {
    const remainingPercentage = 1 - totalPercentage;
    const baseMealsCount = mealTimes.filter(m => !m.optional).length;
    const additionalPerBaseMeal = remainingPercentage / baseMealsCount;
    mealTimes.forEach(meal => {
      if (!meal.optional) {
        meal.percentage += additionalPerBaseMeal;
      }
    });
  }


  const getPreferredFoods = (category: 'carb' | 'protein' | 'vegetable' | 'fruit', preferences: string | undefined) => {
    if (preferences) {
      const preferredList = preferences.split(',').map(p => p.trim().toLowerCase());
      return sampleFoods.filter(food =>
        food.category === category &&
        preferredList.some(pref => food.name.toLowerCase().includes(pref)) &&
        !dietaryRestrictions.toLowerCase().includes(food.name.toLowerCase())
      );
    }
    return sampleFoods.filter(food =>
      food.category === category &&
      !dietaryRestrictions.toLowerCase().includes(food.name.toLowerCase())
    );
  };

  const getRandomFood = (category: 'carb' | 'protein' | 'fat' | 'vegetable' | 'fruit', preferences: string | undefined) => {
    const availableFoods = getPreferredFoods(category, preferences);
    if (availableFoods.length === 0) {
      // Fallback to any food of the category if preferred/non-restricted are not found
      return sampleFoods.filter(f => f.category === category && !dietaryRestrictions.toLowerCase().includes(f.name.toLowerCase()))[0];
    }
    return availableFoods[Math.floor(Math.random() * availableFoods.length)];
  };

  mealTimes.forEach(mealInfo => {
    const mealCalories = Math.round(totalCalories * mealInfo.percentage);
    const mealItems: { food: string; quantity: string; substitutions: string[] }[] = [];
    let currentMealCalories = 0;

    // Prioritize protein and carb for main meals
    if (mealInfo.name === "Café da Manhã" || mealInfo.name === "Almoço" || mealInfo.name === "Jantar") {
      const protein = getRandomFood('protein', foodPreferences.preferredProteins);
      if (protein) {
        const servings = Math.max(1, Math.round(mealCalories * 0.3 / protein.caloriesPerServing)); // ~30% from protein
        mealItems.push({
          food: `${protein.name}`,
          quantity: `${servings * parseInt(protein.servingSize.replace('g', '').replace('unidade', '1'))}${protein.servingSize.includes('g') ? 'g' : ' unidades'}`,
          substitutions: protein.substitutions || []
        });
        currentMealCalories += servings * protein.caloriesPerServing;
      }

      const carb = getRandomFood('carb', foodPreferences.preferredCarbs);
      if (carb) {
        const servings = Math.max(1, Math.round(mealCalories * 0.4 / carb.caloriesPerServing)); // ~40% from carb
        mealItems.push({
          food: `${carb.name}`,
          quantity: `${servings * parseInt(carb.servingSize.replace('g', '').replace('unidade', '1'))}${carb.servingSize.includes('g') ? 'g' : ' unidades'}`,
          substitutions: carb.substitutions || []
        });
        currentMealCalories += servings * carb.caloriesPerServing;
      }

      // Add vegetables for main meals (usually "à vontade")
      const vegetable = getRandomFood('vegetable', foodPreferences.preferredVegetables);
      if (vegetable) {
        mealItems.push({
          food: `${vegetable.name}`,
          quantity: vegetable.servingSize,
          substitutions: vegetable.substitutions || []
        });
      }

      // Add a small amount of healthy fat
      const fat = getRandomFood('fat', undefined); // No specific preference for fats
      if (fat && Math.random() > 0.5) { // Randomly add fat
        mealItems.push({
          food: `${fat.name}`,
          quantity: fat.servingSize,
          substitutions: fat.substitutions || []
        });
        currentMealCalories += fat.caloriesPerServing;
      }

    } else { // Snacks
      const snackOption = Math.random() > 0.5 ? getRandomFood('carb', foodPreferences.preferredCarbs) : getRandomFood('protein', foodPreferences.preferredProteins);
      if (snackOption) {
        const servings = Math.max(1, Math.round(mealCalories / snackOption.caloriesPerServing));
        mealItems.push({
          food: `${snackOption.name}`,
          quantity: `${servings * parseInt(snackOption.servingSize.replace('g', '').replace('unidade', '1'))}${snackOption.servingSize.includes('g') ? 'g' : ' unidades'}`,
          substitutions: snackOption.substitutions || []
        });
        currentMealCalories += servings * snackOption.caloriesPerServing;
      }
      const fruit = getRandomFood('fruit', foodPreferences.preferredFruits);
      if (fruit && Math.random() > 0.5) { // Add fruit to some snacks
        mealItems.push({
          food: `${fruit.name}`,
          quantity: fruit.servingSize,
          substitutions: fruit.substitutions || []
        });
        currentMealCalories += fruit.caloriesPerServing;
      }
    }

    meals.push({
      time: formatTime(mealInfo.time),
      name: mealInfo.name,
      items: mealItems,
    });
  });

  return meals;
};