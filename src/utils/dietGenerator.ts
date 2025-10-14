import { AllFormData, Meal, MealItemDetails, calculateBMR, calculateTDEE, adjustCaloriesForGoal, calculateMacronutrients } from "./dietCalculations";
import { foodDatabase, FoodItem } from "../data/foodDatabase";

// Remove a importação de arquivos .txt, pois a geração será dinâmica
// const dietPlanFiles = import.meta.glob('../data/diet-plans/*.txt', { as: 'raw', eager: true });

// Remove a interface DietPlanMetadata e a função parseFilename, pois não serão mais usadas
// interface DietPlanMetadata {
//   filename: string;
//   goal: string;
//   gender: string;
//   age: number;
//   weight: number;
//   restrictions: string[];
//   content: string;
// }
// const parseFilename = (filename: string): Omit<DietPlanMetadata, 'content'> | null => { /* ... */ };
// const allDietPlansMetadata: DietPlanMetadata[] = Object.entries(dietPlanFiles) /* ... */ ;

// Nova função para selecionar e gerar o plano de dieta dinamicamente
export const generateDietPlan = (formData: AllFormData): { meals: Meal[], totalCalories: number, totalProtein: number, totalCarbs: number, totalFat: number } | null => {
  const { profile, activity, goals, routine, foodPreferences } = formData;

  if (!profile || !activity || !goals || !routine || !foodPreferences) {
    console.error("Dados incompletos para gerar a dieta dinâmica.");
    return null;
  }

  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, activity.trainingLevel);
  const targetCalories = adjustCaloriesForGoal(tdee, goals.goal);
  const targetMacros = calculateMacronutrients(targetCalories, goals.goal, profile.weight);

  console.log("Target Calories:", targetCalories);
  console.log("Target Macros:", targetMacros);

  const userRestrictions = foodPreferences.dietaryRestrictions?.toLowerCase().split(',').map(s => s.trim()).filter(Boolean) || [];
  const isVegetarian = userRestrictions.includes('vegetariano');
  const isVegan = userRestrictions.includes('vegano');
  const isGlutenFree = userRestrictions.includes('sem gluten') || userRestrictions.includes('semglúten');
  const isLactoseFree = userRestrictions.includes('sem lactose') || userRestrictions.includes('semlactose');
  const isLowCarb = userRestrictions.includes('low carb') || userRestrictions.includes('lowcarb');

  const filterFoodItems = (category: FoodItem['category'], excludeIds: string[] = []) => {
    return foodDatabase.filter(item =>
      item.category === category &&
      !excludeIds.includes(item.id) &&
      (!isVegetarian || item.isVegetarian) &&
      (!isVegan || item.isVegan) &&
      (!isGlutenFree || item.isGlutenFree) &&
      (!isLactoseFree || item.isLactoseFree)
    );
  };

  const meals: Meal[] = [];
  let currentTotalCalories = 0;
  let currentTotalProtein = 0;
  let currentTotalCarbs = 0;
  let currentTotalFat = 0;

  // Distribuição de macros por refeição (exemplo, pode ser ajustado)
  const mealDistribution = {
    breakfast: { calories: 0.20, protein: 0.20, carbs: 0.25, fat: 0.20 },
    lunch: { calories: 0.35, protein: 0.35, carbs: 0.35, fat: 0.35 },
    snack: { calories: 0.10, protein: 0.10, carbs: 0.10, fat: 0.10 },
    dinner: { calories: 0.30, protein: 0.30, carbs: 0.25, fat: 0.30 },
    // Adicione outras refeições se necessário
  };

  const mealTimes = [
    { name: 'Café da manhã', time: routine.breakfastTime, key: 'breakfast' },
    { name: 'Almoço', time: routine.lunchTime, key: 'lunch' },
    { name: 'Jantar', time: routine.dinnerTime, key: 'dinner' },
  ];

  if (routine.snackTime) {
    mealTimes.splice(2, 0, { name: 'Lanche', time: routine.snackTime, key: 'snack' });
  }

  for (const mealConfig of mealTimes) {
    const mealTargetCalories = targetCalories * mealDistribution[mealConfig.key as keyof typeof mealDistribution].calories;
    const mealTargetProtein = targetMacros.protein * mealDistribution[mealConfig.key as keyof typeof mealDistribution].protein;
    const mealTargetCarbs = targetMacros.carbs * mealDistribution[mealConfig.key as keyof typeof mealDistribution].carbs;
    const mealTargetFat = targetMacros.fat * mealDistribution[mealConfig.key as keyof typeof mealDistribution].fat;

    const meal: Meal = {
      name: mealConfig.name,
      time: mealConfig.time,
      items: [],
      totalMealCalories: 0,
      totalMealProtein: 0,
      totalMealCarbs: 0,
      totalMealFat: 0,
    };

    let remainingCalories = mealTargetCalories;
    let remainingProtein = mealTargetProtein;
    let remainingCarbs = mealTargetCarbs;
    let remainingFat = mealTargetFat;

    // Lógica de geração de refeições (simplificada para o exemplo)
    // Esta parte precisaria ser mais robusta para gerar dietas realmente realistas
    // e considerar a combinação de alimentos para atingir os macros.
    // Por enquanto, vamos adicionar alguns itens básicos.

    // Adicionar proteína
    const proteins = filterFoodItems('protein');
    if (proteins.length > 0) {
      const proteinItem = proteins[Math.floor(Math.random() * proteins.length)];
      const quantity = Math.min(proteinItem.defaultQuantity || 100, Math.round(remainingProtein / (proteinItem.proteinPer100g / 100)));
      if (quantity > 0) {
        const itemCalories = (proteinItem.caloriesPer100g / 100) * quantity;
        const itemProtein = (proteinItem.proteinPer100g / 100) * quantity;
        const itemCarbs = (proteinItem.carbsPer100g / 100) * quantity;
        const itemFat = (proteinItem.fatPer100g / 100) * quantity;

        meal.items.push({
          food: proteinItem.name,
          quantity: `${quantity}${proteinItem.unit || 'g'}`,
          substitutions: proteinItem.substitutions?.map(id => foodDatabase.find(f => f.id === id)?.name || id) || [],
          calories: Math.round(itemCalories),
          protein: Math.round(itemProtein),
          carbs: Math.round(itemCarbs),
          fat: Math.round(itemFat),
        });
        remainingCalories -= itemCalories;
        remainingProtein -= itemProtein;
        remainingCarbs -= itemCarbs;
        remainingFat -= itemFat;
      }
    }

    // Adicionar carboidrato
    const carbs = filterFoodItems('carb');
    if (carbs.length > 0 && remainingCarbs > 0) {
      const carbItem = carbs[Math.floor(Math.random() * carbs.length)];
      const quantity = Math.min(carbItem.defaultQuantity || 100, Math.round(remainingCarbs / (carbItem.carbsPer100g / 100)));
      if (quantity > 0) {
        const itemCalories = (carbItem.caloriesPer100g / 100) * quantity;
        const itemProtein = (carbItem.proteinPer100g / 100) * quantity;
        const itemCarbs = (carbItem.carbsPer100g / 100) * quantity;
        const itemFat = (carbItem.fatPer100g / 100) * quantity;

        meal.items.push({
          food: carbItem.name,
          quantity: `${quantity}${carbItem.unit || 'g'}`,
          substitutions: carbItem.substitutions?.map(id => foodDatabase.find(f => f.id === id)?.name || id) || [],
          calories: Math.round(itemCalories),
          protein: Math.round(itemProtein),
          carbs: Math.round(itemCarbs),
          fat: Math.round(itemFat),
        });
        remainingCalories -= itemCalories;
        remainingProtein -= itemProtein;
        remainingCarbs -= itemCarbs;
        remainingFat -= itemFat;
      }
    }

    // Adicionar vegetal (sempre 'a gosto' e com macros mínimos)
    const vegetables = filterFoodItems('vegetable');
    if (vegetables.length > 0) {
      const veggieItem = vegetables[Math.floor(Math.random() * vegetables.length)];
      meal.items.push({
        food: veggieItem.name,
        quantity: 'a gosto',
        substitutions: [],
        calories: 10, // Estimativa mínima
        protein: 1,
        carbs: 2,
        fat: 0,
      });
    }

    // Calcular totais da refeição
    meal.totalMealCalories = Math.round(meal.items.reduce((sum, item) => sum + item.calories, 0));
    meal.totalMealProtein = Math.round(meal.items.reduce((sum, item) => sum + item.protein, 0));
    meal.totalMealCarbs = Math.round(meal.items.reduce((sum, item) => sum + item.carbs, 0));
    meal.totalMealFat = Math.round(meal.items.reduce((sum, item) => sum + item.fat, 0));

    meals.push(meal);

    currentTotalCalories += meal.totalMealCalories;
    currentTotalProtein += meal.totalMealProtein;
    currentTotalCarbs += meal.totalMealCarbs;
    currentTotalFat += meal.totalMealFat;
  }

  return {
    meals,
    totalCalories: Math.round(currentTotalCalories),
    totalProtein: Math.round(currentTotalProtein),
    totalCarbs: Math.round(currentTotalCarbs),
    totalFat: Math.round(currentTotalFat),
  };
};

// A função parseDietPlanText ainda pode ser útil para planos estáticos ou para depuração,
// mas não será usada na geração dinâmica.
export const parseDietPlanText = (text: string): Meal[] => {
  const meals: Meal[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log('All lines from diet plan text:', lines); // DEBUG

  let currentMeal: Meal | null = null;

  for (const line of lines) {
    const mealHeaderMatch = line.match(/^#\s(.+)\s\((\d{2}:\d{2})\)$/);
    if (mealHeaderMatch) {
      if (currentMeal) {
        meals.push(currentMeal);
      }
      currentMeal = {
        name: mealHeaderMatch[1],
        time: mealHeaderMatch[2],
        items: [],
        totalMealCalories: 0,
        totalMealProtein: 0,
        totalMealCarbs: 0,
        totalMealFat: 0,
      };
      console.log('Found meal header:', currentMeal.name, currentMeal.time); // DEBUG
      continue;
    }

    if (!currentMeal) {
      continue;
    }

    const caloriesMatch = line.match(/^Calorias:\s*~?(\d+)\s*kcal$/);
    if (caloriesMatch) {
      currentMeal.totalMealCalories = parseInt(caloriesMatch[1]);
      console.log('Found meal calories:', currentMeal.totalMealCalories); // DEBUG
      continue;
    }

    const substitutionsMatch = line.match(/^Substituições:\s*(.+)$/);
    if (substitutionsMatch) {
      if (currentMeal.items.length > 0) {
        const lastItem = currentMeal.items[currentMeal.items.length - 1];
        lastItem.substitutions = substitutionsMatch[1].split(';').map(s => s.trim()).filter(Boolean);
        console.log('Found substitutions for last item:', lastItem.substitutions); // DEBUG
      }
      continue;
    }

    const itemMatch = line.match(/^- (.+)$/);
    if (itemMatch) {
      const foodItem: MealItemDetails = {
        food: itemMatch[1],
        quantity: "a gosto",
        substitutions: [],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
      currentMeal.items.push(foodItem);
      console.log('Found meal item:', foodItem.food); // DEBUG
      continue;
    }
    
    if (line && !line.startsWith('Total Diário:') && !line.startsWith('Observações:') && !line.startsWith('---') && !line.startsWith('# Perfil:')) {
      console.log('Skipping unrecognized line:', line); // DEBUG
    }
  }

  if (currentMeal) {
    meals.push(currentMeal);
  }
  
  console.log('Parsed meals:', meals); // DEBUG
  return meals;
};