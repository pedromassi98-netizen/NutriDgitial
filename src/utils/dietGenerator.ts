import { AllFormData, Meal, MealItemDetails, calculateBMR, calculateTDEE, adjustCaloriesForGoal, calculateMacronutrients } from "./dietCalculations";
import { foodDatabase, FoodItem } from "../data/foodDatabase";

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

  const getPreferredFoodIds = (foodIdArray: string[] | undefined) => {
    return foodIdArray || [];
  };

  const preferredBreakfastFoodIds = getPreferredFoodIds(foodPreferences.preferredBreakfastFoods);
  const preferredLunchFoodIds = getPreferredFoodIds(foodPreferences.preferredLunchFoods);
  const preferredSnackFoodIds = getPreferredFoodIds(foodPreferences.preferredSnackFoods);
  const preferredDinnerFoodIds = getPreferredFoodIds(foodPreferences.preferredDinnerFoods);

  const filterFoodItems = (category: FoodItem['category'], preferredIds: string[], mealType: FoodItem['mealTypes'][number], excludeIds: string[] = []) => {
    let filtered = foodDatabase.filter(item =>
      item.category === category &&
      item.mealTypes.includes(mealType) && // Filtrar por mealType
      !excludeIds.includes(item.id)
    );

    // Prioritize preferred foods
    const preferredItems = filtered.filter(item => preferredIds.includes(item.id));
    const otherItems = filtered.filter(item => !preferredIds.includes(item.id));

    return [...preferredItems, ...otherItems]; // Preferred items come first
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
  };

  const mealTimes = [
    { name: 'Café da manhã', time: routine.breakfastTime, key: 'breakfast', preferred: preferredBreakfastFoodIds },
    { name: 'Almoço', time: routine.lunchTime, key: 'lunch', preferred: preferredLunchFoodIds },
    { name: 'Jantar', time: routine.dinnerTime, key: 'dinner', preferred: preferredDinnerFoodIds },
  ];

  if (routine.snackTime) {
    mealTimes.splice(2, 0, { name: 'Lanche', time: routine.snackTime, key: 'snack', preferred: preferredSnackFoodIds });
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

    let currentMealCalories = 0;
    let currentMealProtein = 0;
    let currentMealCarbs = 0;
    let currentMealFat = 0;
    const addedFoodIds: string[] = [];

    // Função auxiliar para adicionar um item à refeição
    const addItemToMeal = (foodItem: FoodItem, quantity: number, isMainComponent: boolean = true) => {
      if (quantity <= 0) return;

      const itemCalories = (foodItem.caloriesPer100g / 100) * quantity;
      const itemProtein = (foodItem.proteinPer100g / 100) * quantity;
      const itemCarbs = (foodItem.carbsPer100g / 100) * quantity;
      const itemFat = (foodItem.fatPer100g / 100) * quantity;

      meal.items.push({
        food: foodItem.name,
        quantity: `${quantity}${foodItem.unit || 'g'}`,
        substitutions: foodItem.substitutions?.map(id => foodDatabase.find(f => f.id === id)?.name || id) || [],
        calories: Math.round(itemCalories),
        protein: Math.round(itemProtein),
        carbs: Math.round(itemCarbs),
        fat: Math.round(itemFat),
      });
      addedFoodIds.push(foodItem.id);
      currentMealCalories += itemCalories;
      currentMealProtein += itemProtein;
      currentMealCarbs += itemCarbs;
      currentMealFat += itemFat;
    };

    // 1. Adicionar Proteína Principal
    const proteins = filterFoodItems('protein', mealConfig.preferred, mealConfig.key as FoodItem['mealTypes'][number]);
    if (proteins.length > 0) {
      const proteinItem = proteins[0];
      const targetProteinQuantity = Math.round((mealTargetProtein / (proteinItem.proteinPer100g / 100)) * 0.8); // Tentar 80% do alvo de proteína
      addItemToMeal(proteinItem, targetProteinQuantity);
    }

    // 2. Adicionar Carboidrato Principal
    const carbs = filterFoodItems('carb', mealConfig.preferred, mealConfig.key as FoodItem['mealTypes'][number], addedFoodIds);
    if (carbs.length > 0) {
      const carbItem = carbs[0];
      const targetCarbQuantity = Math.round((mealTargetCarbs / (carbItem.carbsPer100g / 100)) * 0.8); // Tentar 80% do alvo de carboidrato
      addItemToMeal(carbItem, targetCarbQuantity);
    }

    // 3. Adicionar Vegetal (a gosto)
    const vegetables = filterFoodItems('vegetable', mealConfig.preferred, mealConfig.key as FoodItem['mealTypes'][number], addedFoodIds);
    if (vegetables.length > 0) {
      const veggieItem = vegetables[0];
      meal.items.push({
        food: veggieItem.name,
        quantity: 'a gosto',
        substitutions: [],
        calories: 10, // Estimativa mínima
        protein: 1,
        carbs: 2,
        fat: 0,
      });
      addedFoodIds.push(veggieItem.id);
      currentMealCalories += 10;
      currentMealProtein += 1;
      currentMealCarbs += 2;
      currentMealFat += 0;
    }

    // 4. Adicionar Gordura Saudável (se necessário e não já coberto)
    const fats = filterFoodItems('fat', mealConfig.preferred, mealConfig.key as FoodItem['mealTypes'][number], addedFoodIds);
    if (fats.length > 0 && currentMealFat < mealTargetFat * 0.5) { // Se a gordura ainda estiver baixa
      const fatItem = fats[0];
      const targetFatQuantity = Math.round(((mealTargetFat - currentMealFat) / (fatItem.fatPer100g / 100)) * 0.5); // Tentar cobrir 50% da gordura restante
      addItemToMeal(fatItem, targetFatQuantity);
    }

    // 5. Ajustar com frutas ou laticínios para lanches ou café da manhã
    if (mealConfig.key === 'breakfast' || mealConfig.key === 'snack') {
      const fruits = filterFoodItems('fruit', mealConfig.preferred, mealConfig.key as FoodItem['mealTypes'][number], addedFoodIds);
      if (fruits.length > 0 && currentMealCarbs < mealTargetCarbs * 0.9) {
        const fruitItem = fruits[0];
        addItemToMeal(fruitItem, fruitItem.defaultQuantity || 100, false);
      }
      const dairy = filterFoodItems('dairy', mealConfig.preferred, mealConfig.key as FoodItem['mealTypes'][number], addedFoodIds);
      if (dairy.length > 0 && currentMealProtein < mealTargetProtein * 0.9) {
        const dairyItem = dairy[0];
        addItemToMeal(dairyItem, dairyItem.defaultQuantity || 100, false);
      }
    }

    // Calcular totais da refeição
    meal.totalMealCalories = Math.round(currentMealCalories);
    meal.totalMealProtein = Math.round(currentMealProtein);
    meal.totalMealCarbs = Math.round(currentMealCarbs);
    meal.totalMealFat = Math.round(currentMealFat);

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