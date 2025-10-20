import { AllFormData, Meal, MealItemDetails, calculateBMR, calculateTDEE, adjustCaloriesForGoal, calculateMacronutrients } from "./dietCalculations";
import { foodDatabase, FoodItem } from "../data/foodDatabase";

// Helper function to calculate quantity and macros for a given food item and target calories
const calculateAdjustedQuantityAndDetails = (
  foodItem: FoodItem,
  targetCalories: number
) => {
  let actualGrams = 0;
  let displayQuantity = '';
  let itemCalories = 0;
  let itemProtein = 0;
  let itemCarbs = 0;
  let itemFat = 0;

  if (foodItem.caloriesPer100g > 0) {
    actualGrams = (targetCalories / foodItem.caloriesPer100g) * 100;
  } else {
    // If food has 0 calories, or is 'a gosto', we can't calculate based on targetCalories.
    return null;
  }

  // Ensure a minimum quantity for practical purposes, especially for 'unidade'/'fatia'
  if (foodItem.unit === 'unidade' || foodItem.unit === 'fatia') {
    const units = Math.round(actualGrams / (foodItem.servingSizeGrams || 1));
    actualGrams = Math.max(1, units) * (foodItem.servingSizeGrams || 1);
    displayQuantity = `${Math.max(1, units)} ${foodItem.unit}`;
  } else if (foodItem.unit === 'g') {
    actualGrams = Math.max(10, Math.round(actualGrams)); // Minimum 10g for practical serving
    displayQuantity = `${actualGrams}g`;
  } else if (foodItem.unit === 'ml') {
    actualGrams = Math.max(10, Math.round(actualGrams)); // Minimum 10ml for practical serving
    displayQuantity = `${actualGrams}ml`;
  } else if (foodItem.unit === 'a gosto') {
    displayQuantity = 'a gosto';
    actualGrams = 0; // No caloric contribution for 'a gosto'
  }

  itemCalories = (foodItem.caloriesPer100g / 100) * actualGrams;
  itemProtein = (foodItem.proteinPer100g / 100) * actualGrams;
  itemCarbs = (foodItem.carbsPer100g / 100) * actualGrams;
  itemFat = (foodItem.fatPer100g / 100) * actualGrams;

  return {
    displayQuantity,
    calories: Math.round(itemCalories),
    protein: Math.round(itemProtein),
    carbs: Math.round(itemCarbs),
    fat: Math.round(itemFat),
  };
};

// Helper function to add an item to the meal with calculated details and substitutions
const addItemToMeal = (
  meal: Meal,
  foodItem: FoodItem,
  quantityForCalculation: number, // This is the quantity in its natural unit (e.g., 3 for eggs, 100 for chicken)
  substitutionsForThisItem: string[] = [],
  addedFoodIds: string[]
) => {
  let actualGrams = 0;
  let displayQuantity = '';

  if (foodItem.unit === 'unidade' || foodItem.unit === 'fatia') {
    actualGrams = quantityForCalculation * (foodItem.servingSizeGrams || 1);
    displayQuantity = `${quantityForCalculation} ${foodItem.unit}`;
  } else if (foodItem.unit === 'g') {
    actualGrams = quantityForCalculation;
    displayQuantity = `${quantityForCalculation}g`;
  } else if (foodItem.unit === 'ml') {
    actualGrams = quantityForCalculation;
    displayQuantity = `${quantityForCalculation}ml`;
  } else if (foodItem.unit === 'a gosto') {
    actualGrams = 0;
    displayQuantity = 'a gosto';
  }

  const itemCalories = (foodItem.caloriesPer100g / 100) * actualGrams;
  const itemProtein = (foodItem.proteinPer100g / 100) * actualGrams;
  const itemCarbs = (foodItem.carbsPer100g / 100) * actualGrams;
  const itemFat = (foodItem.fatPer100g / 100) * actualGrams;

  meal.items.push({
    food: foodItem.name,
    quantity: displayQuantity,
    substitutions: substitutionsForThisItem,
    calories: Math.round(itemCalories),
    protein: Math.round(itemProtein),
    carbs: Math.round(itemCarbs),
    fat: Math.round(itemFat),
  });
  addedFoodIds.push(foodItem.id);
  meal.totalMealCalories += itemCalories;
  meal.totalMealProtein += itemProtein;
  meal.totalMealCarbs += itemCarbs;
  meal.totalMealFat += itemFat;
};

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
  const preferredFruitFoodIds = getPreferredFoodIds(foodPreferences.preferredFruits);
  const preferredFatFoodIds = getPreferredFoodIds(foodPreferences.preferredFats);

  // --- Lógica de Filtragem de Alimentos com base nas Restrições e Alimentos Não Gostados ---
  const rawRestrictions = foodPreferences.dietaryRestrictions?.toLowerCase() || "";
  const isGlutenFreeRequired = rawRestrictions.includes("glúten") || rawRestrictions.includes("gluten") || rawRestrictions.includes("sem glúten");
  const isLactoseFreeRequired = rawRestrictions.includes("lactose") || rawRestrictions.includes("sem lactose");
  const dislikedFoodIds = foodPreferences.dislikedFoods || [];

  const baseFoodList = foodDatabase.filter(food => {
    if (isGlutenFreeRequired && food.isGlutenFree === false) {
      return false;
    }
    if (isLactoseFreeRequired && food.isLactoseFree === false) {
      return false;
    }
    if (dislikedFoodIds.includes(food.id)) {
      return false;
    }
    return true;
  });

  // Helper function to get eligible foods for a category, prioritizing preferred ones
  const getEligibleFoodsForCategory = (
    category: FoodItem['category'],
    mealType: FoodItem['mealTypes'][number],
    preferredIds: string[],
    excludeIds: string[] = []
  ) => {
    let eligible = baseFoodList.filter(item => // Usar a baseFoodList filtrada aqui
      item.category === category &&
      item.mealTypes.includes(mealType) &&
      !excludeIds.includes(item.id) &&
      item.unit !== 'a gosto' &&
      item.caloriesPer100g > 0
    );

    const preferredItems = eligible.filter(item => preferredIds.includes(item.id));
    const otherItems = eligible.filter(item => !preferredIds.includes(item.id));

    return [...preferredItems, ...otherItems]; // Preferred items first, then others
  };

  const meals: Meal[] = [];
  let currentTotalCalories = 0;
  let currentTotalProtein = 0;
  let currentTotalCarbs = 0;
  let currentTotalFat = 0;

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

  let fruitsAddedToday = 0; // Contador global de frutas adicionadas no dia

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

    const addedFoodIds: string[] = []; // Reset for each meal

    // Add "Vegetais à gosto" for lunch and dinner
    if (mealConfig.key === 'lunch' || mealConfig.key === 'dinner') {
      meal.items.push({
        food: 'Vegetais à gosto',
        quantity: 'a gosto',
        substitutions: [],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
      addedFoodIds.push('vegetais_a_gosto_placeholder');
    }

    // --- 1. Adicionar Proteína Principal e suas substituições ---
    let availableProteins = getEligibleFoodsForCategory('protein', mealConfig.key as FoodItem['mealTypes'][number], mealConfig.preferred, addedFoodIds);
    if (availableProteins.length === 0) {
      console.warn(`No suitable protein found for ${mealConfig.name} based on preferences. Falling back to any protein.`);
      availableProteins = getEligibleFoodsForCategory('protein', mealConfig.key as FoodItem['mealTypes'][number], [], addedFoodIds); // Get any protein
    }
    if (availableProteins.length > 0) {
      const proteinItem = availableProteins[0]; // Pick the first available as primary
      const gramsNeededForProtein = (mealTargetProtein / (proteinItem.proteinPer100g / 100)) * 0.8; // Base on protein macro target

      let primaryProteinQuantityForDisplay = proteinItem.defaultQuantity; // Default to item's default
      let primaryProteinActualGrams = proteinItem.defaultQuantity;
      
      if (proteinItem.unit === 'unidade' || proteinItem.unit === 'fatia') {
        primaryProteinQuantityForDisplay = Math.max(1, Math.round(gramsNeededForProtein / (proteinItem.servingSizeGrams || 1)));
        primaryProteinActualGrams = primaryProteinQuantityForDisplay * (proteinItem.servingSizeGrams || 1);
      } else if (proteinItem.unit === 'g' || proteinItem.unit === 'ml') {
        primaryProteinQuantityForDisplay = Math.max(10, Math.round(gramsNeededForProtein));
        primaryProteinActualGrams = primaryProteinQuantityForDisplay;
      }

      const primaryProteinTotalCalories = (proteinItem.caloriesPer100g / 100) * primaryProteinActualGrams;

      const substitutionsForProtein: string[] = [];
      // Use all available proteins (excluding the primary one) for substitutions, limited to 3
      availableProteins.slice(1).slice(0, 3).forEach(substitute => { // LIMITADO A 3 SUBSTITUIÇÕES
        const adjustedDetails = calculateAdjustedQuantityAndDetails(substitute, primaryProteinTotalCalories);
        if (adjustedDetails) {
          substitutionsForProtein.push(`${substitute.name} (${adjustedDetails.displayQuantity})`);
        }
      });
      
      addItemToMeal(meal, proteinItem, primaryProteinQuantityForDisplay, substitutionsForProtein, addedFoodIds);
    } else {
      console.error(`Critical: No protein could be added to ${mealConfig.name}. This meal might be incomplete.`);
    }

    // --- 2. Adicionar Carboidrato Principal e suas substituições ---
    let availableCarbs = getEligibleFoodsForCategory('carb', mealConfig.key as FoodItem['mealTypes'][number], mealConfig.preferred, addedFoodIds);
    if (availableCarbs.length === 0) {
      console.warn(`No suitable carb found for ${mealConfig.name} based on preferences. Falling back to any carb.`);
      availableCarbs = getEligibleFoodsForCategory('carb', mealConfig.key as FoodItem['mealTypes'][number], [], addedFoodIds); // Get any carb
    }
    if (availableCarbs.length > 0) {
      const carbItem = availableCarbs[0]; // Pick the first available as primary
      const gramsNeededForCarb = (mealTargetCarbs / (carbItem.carbsPer100g / 100)) * 0.8; // Base on carb macro target

      let primaryCarbQuantityForDisplay = carbItem.defaultQuantity;
      let primaryCarbActualGrams = carbItem.defaultQuantity;

      if (carbItem.unit === 'unidade' || carbItem.unit === 'fatia') {
        primaryCarbQuantityForDisplay = Math.max(1, Math.round(gramsNeededForCarb / (carbItem.servingSizeGrams || 1)));
        primaryCarbActualGrams = primaryCarbQuantityForDisplay * (carbItem.servingSizeGrams || 1);
      } else if (carbItem.unit === 'g' || carbItem.unit === 'ml') {
        primaryCarbQuantityForDisplay = Math.max(10, Math.round(gramsNeededForCarb));
        primaryCarbActualGrams = primaryCarbQuantityForDisplay;
      }

      const primaryCarbTotalCalories = (carbItem.caloriesPer100g / 100) * primaryCarbActualGrams;

      const substitutionsForCarb: string[] = [];
      // Use all available carbs (excluding the primary one) for substitutions, limited to 3
      availableCarbs.slice(1).slice(0, 3).forEach(substitute => { // LIMITADO A 3 SUBSTITUIÇÕES
        const adjustedDetails = calculateAdjustedQuantityAndDetails(substitute, primaryCarbTotalCalories);
        if (adjustedDetails) {
          substitutionsForCarb.push(`${substitute.name} (${adjustedDetails.displayQuantity})`);
        }
      });
      
      addItemToMeal(meal, carbItem, primaryCarbQuantityForDisplay, substitutionsForCarb, addedFoodIds);
    } else {
      console.error(`Critical: No carb could be added to ${mealConfig.name}. This meal might be incomplete.`);
    }

    // --- 3. Adicionar Leguminosas e Laticínios (se preferidos e não adicionados como proteína/carb principal) ---
    const additionalPreferredFoods = baseFoodList.filter(item => // Usar a baseFoodList filtrada aqui
      (mealConfig.preferred.includes(item.id)) &&
      (item.category === 'legume' || item.category === 'dairy') &&
      item.mealTypes.includes(mealConfig.key as FoodItem['mealTypes'][number]) &&
      !addedFoodIds.includes(item.id) &&
      item.caloriesPer100g > 0
    );

    additionalPreferredFoods.forEach(foodItem => {
      if (!addedFoodIds.includes(foodItem.id)) {
        const quantityToAdd = foodItem.defaultQuantity;
        const itemCalories = (foodItem.caloriesPer100g / 100) * quantityToAdd;
        const itemProtein = (foodItem.proteinPer100g / 100) * quantityToAdd;
        const itemCarbs = (foodItem.carbsPer100g / 100) * quantityToAdd;

        if (meal.totalMealCalories + itemCalories < mealTargetCalories * 1.2 &&
            meal.totalMealProtein + itemProtein < mealTargetProtein * 1.5 &&
            meal.totalMealCarbs + itemCarbs < mealTargetCarbs * 1.5) {
          addItemToMeal(meal, foodItem, quantityToAdd, [], addedFoodIds);
        }
      }
    });

    // --- 4. Adicionar Gordura Saudável (priorizando as preferidas) ---
    const eligiblePreferredFats = getEligibleFoodsForCategory('fat', mealConfig.key as FoodItem['mealTypes'][number], preferredFatFoodIds, addedFoodIds);

    if (eligiblePreferredFats.length > 0 && meal.totalMealFat < mealTargetFat * 0.9) {
      const fatItem = eligiblePreferredFats[Math.floor(Math.random() * eligiblePreferredFats.length)];
      const remainingFatCalories = mealTargetFat * 0.9 - meal.totalMealFat;
      const quantityForCalculation = (remainingFatCalories / (fatItem.fatPer100g / 100)) * 0.5;
      
      if (quantityForCalculation > 0) {
        addItemToMeal(meal, fatItem, Math.max(fatItem.defaultQuantity, Math.round(quantityForCalculation)), [], addedFoodIds);
      }
    }

    // --- 5. Adicionar Frutas (APENAS para Café da manhã e Lanche, com limite de 2 por dia) ---
    if ((mealConfig.key === 'breakfast' || mealConfig.key === 'snack') && fruitsAddedToday < 2) {
      const eligibleFruits = getEligibleFoodsForCategory('fruit', mealConfig.key as FoodItem['mealTypes'][number], preferredFruitFoodIds, addedFoodIds);

      // Tenta adicionar frutas preferidas primeiro
      for (const fruitItem of eligibleFruits) {
        if (fruitsAddedToday >= 2) break;

        const estimatedFruitCalories = (fruitItem.caloriesPer100g / 100) * fruitItem.defaultQuantity;
        if (meal.totalMealCalories + estimatedFruitCalories < mealTargetCalories * 1.1 &&
            meal.totalMealCarbs + (fruitItem.carbsPer100g / 100) * fruitItem.defaultQuantity < mealTargetCarbs * 1.1) {
          addItemToMeal(meal, fruitItem, fruitItem.defaultQuantity, [], addedFoodIds);
          fruitsAddedToday++;
        }
      }

      // Se menos de 2 frutas foram adicionadas, tenta adicionar frutas de fallback
      if (fruitsAddedToday < 2) {
        const fallbackFruits = baseFoodList.filter(item => // Usar a baseFoodList filtrada aqui
          item.category === 'fruit' &&
          item.mealTypes.includes(mealConfig.key as FoodItem['mealTypes'][number]) &&
          !addedFoodIds.includes(item.id) &&
          item.caloriesPer100g > 0
        );

        for (const fruitItem of fallbackFruits) {
          if (fruitsAddedToday >= 2) break;

          const estimatedFruitCalories = (fruitItem.caloriesPer100g / 100) * fruitItem.defaultQuantity;
          if (meal.totalMealCalories + estimatedFruitCalories < mealTargetCalories * 1.1 &&
              meal.totalMealCarbs + (fruitItem.carbsPer100g / 100) * fruitItem.defaultQuantity < mealTargetCarbs * 1.1) {
            addItemToMeal(meal, fruitItem, fruitItem.defaultQuantity, [], addedFoodIds);
            fruitsAddedToday++;
          }
        }
      }
    }

    // Update meal totals after all items are added
    meal.totalMealCalories = Math.round(meal.totalMealCalories);
    meal.totalMealProtein = Math.round(meal.totalMealProtein);
    meal.totalMealCarbs = Math.round(meal.totalMealCarbs);
    meal.totalMealFat = Math.round(meal.totalMealFat);

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

// The parseDietPlanText function remains unchanged as it's for static plans.
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