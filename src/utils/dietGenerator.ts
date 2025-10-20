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

  // If food has 0 calories, or is 'a gosto', it shouldn't be used for macro calculation based on targetCalories.
  // Return null to indicate it's not suitable for this type of calculation.
  if (foodItem.caloriesPer100g === 0 || foodItem.unit === 'a gosto') {
    return null;
  }

  // Calculate actual grams needed based on target calories
  actualGrams = (targetCalories / foodItem.caloriesPer100g) * 100;

  // Ensure actualGrams is a valid number and not too small
  if (isNaN(actualGrams) || !isFinite(actualGrams) || actualGrams < 1) {
    actualGrams = foodItem.defaultQuantity; // Fallback to default quantity
  }

  // Adjust quantity for display and final grams based on unit
  if (foodItem.unit === 'unidade' || foodItem.unit === 'fatia') {
    const units = Math.max(1, Math.round(actualGrams / (foodItem.servingSizeGrams || 1)));
    actualGrams = units * (foodItem.servingSizeGrams || 1);
    displayQuantity = `${units} ${foodItem.unit}`;
  } else if (foodItem.unit === 'g') {
    actualGrams = Math.max(10, Math.round(actualGrams)); // Minimum 10g for practical serving
    displayQuantity = `${actualGrams}g`;
  } else if (foodItem.unit === 'ml') {
    actualGrams = Math.max(10, Math.round(actualGrams)); // Minimum 10ml for practical serving
    displayQuantity = `${actualGrams}ml`;
  }

  itemCalories = (foodItem.caloriesPer100g / 100) * actualGrams;
  itemProtein = (foodItem.proteinPer100g / 100) * actualGrams;
  itemCarbs = (foodItem.carbsPer100g / 100) * actualGrams;
  itemFat = (foodItem.fatPer100g / 100) * actualGrams;

  // Ensure all calculated macros are finite numbers
  itemCalories = isNaN(itemCalories) || !isFinite(itemCalories) ? 0 : itemCalories;
  itemProtein = isNaN(itemProtein) || !isFinite(itemProtein) ? 0 : itemProtein;
  itemCarbs = isNaN(itemCarbs) || !isFinite(itemCarbs) ? 0 : itemCarbs;
  itemFat = isNaN(itemFat) || !isFinite(itemFat) ? 0 : itemFat;

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
    displayQuantity = `${actualGrams}ml`;
  } else if (foodItem.unit === 'a gosto') {
    actualGrams = 0;
    displayQuantity = 'a gosto';
  }

  const itemCalories = (foodItem.caloriesPer100g / 100) * actualGrams;
  const itemProtein = (foodItem.proteinPer100g / 100) * actualGrams;
  const itemCarbs = (foodItem.carbsPer100g / 100) * actualGrams;
  const itemFat = (foodItem.fatPer100g / 100) * actualGrams;

  // Ensure all calculated macros are finite numbers before adding
  const finalCalories = isNaN(itemCalories) || !isFinite(itemCalories) ? 0 : itemCalories;
  const finalProtein = isNaN(itemProtein) || !isFinite(itemProtein) ? 0 : itemProtein;
  const finalCarbs = isNaN(itemCarbs) || !isFinite(itemCarbs) ? 0 : itemCarbs;
  const finalFat = isNaN(itemFat) || !isFinite(itemFat) ? 0 : itemFat;

  meal.items.push({
    food: foodItem.name,
    quantity: displayQuantity,
    substitutions: substitutionsForThisItem,
    calories: Math.round(finalCalories),
    protein: Math.round(finalProtein),
    carbs: Math.round(finalCarbs),
    fat: Math.round(finalFat),
  });
  addedFoodIds.push(foodItem.id);
  meal.totalMealCalories += finalCalories;
  meal.totalMealProtein += finalProtein;
  meal.totalMealCarbs += finalCarbs;
  meal.totalMealFat += finalFat;
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
    // Excluir 'none_fruits' da lista base para que não seja selecionado acidentalmente
    if (food.id === 'none_fruits') {
      return false;
    }
    return true;
  });

  // Helper function to get eligible foods for a category, prioritizing preferred ones
  const getEligibleFoodsForCategory = (
    category: FoodItem['category'],
    mealType: FoodItem['mealTypes'][number],
    preferredIds: string[],
    excludeIds: string[] = [],
    requiredMacro: 'protein' | 'carbs' | 'fat' | null = null // New parameter
  ) => {
    let eligible = baseFoodList.filter(item => // Usar a baseFoodList filtrada aqui
      item.category === category &&
      item.mealTypes.includes(mealType) &&
      !excludeIds.includes(item.id) &&
      item.unit !== 'a gosto' && // Excluir 'a gosto' para cálculo de macros
      item.caloriesPer100g > 0 // Excluir itens sem calorias para cálculo de macros
    );

    if (requiredMacro === 'protein') {
      eligible = eligible.filter(item => item.proteinPer100g > 0);
    } else if (requiredMacro === 'carbs') {
      eligible = eligible.filter(item => item.carbsPer100g > 0);
    } else if (requiredMacro === 'fat') {
      eligible = eligible.filter(item => item.fatPer100g > 0);
    }

    const preferredItems = eligible.filter(item => preferredIds.includes(item.id));
    const otherItems = eligible.filter(item => !preferredIds.includes(item.id));

    return [...preferredItems, ...otherItems]; // Preferred items first, then others
  };

  const meals: Meal[] = [];
  let currentTotalCalories = 0;
  let currentTotalProtein = 0;
  let currentTotalCarbs = 0;
  let currentTotalFat = 0;

  // Distribuição de macros e calorias por refeição (somando 1.0 para cada)
  const mealDistribution = {
    breakfast: { calories: 0.20, protein: 0.20, carbs: 0.20, fat: 0.20 },
    lunch: { calories: 0.35, protein: 0.35, carbs: 0.35, fat: 0.35 },
    snack: { calories: 0.15, protein: 0.15, carbs: 0.15, fat: 0.15 },
    dinner: { calories: 0.30, protein: 0.30, carbs: 0.30, fat: 0.30 },
  };

  const mealTimes = [
    { name: 'Café da manhã', time: routine.breakfastTime, key: 'breakfast', preferred: preferredBreakfastFoodIds },
    { name: 'Almoço', time: routine.lunchTime, key: 'lunch', preferred: preferredLunchFoodIds },
    { name: 'Jantar', time: routine.dinnerTime, key: 'dinner', preferred: preferredDinnerFoodIds },
  ];

  if (routine.snackTime) {
    mealTimes.splice(2, 0, { name: 'Lanche', time: routine.snackTime, key: 'snack', preferred: preferredSnackFoodIds });
  }

  let fruitAddedToday = false; // Flag para garantir que pelo menos uma fruta seja adicionada

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
    let availableProteins = getEligibleFoodsForCategory('protein', mealConfig.key as FoodItem['mealTypes'][number], mealConfig.preferred, addedFoodIds, 'protein');
    if (availableProteins.length === 0) {
      console.warn(`No suitable protein found for ${mealConfig.name} based on preferences. Falling back to any protein.`);
      availableProteins = getEligibleFoodsForCategory('protein', mealConfig.key as FoodItem['mealTypes'][number], [], addedFoodIds, 'protein'); // Get any protein
    }
    if (availableProteins.length > 0) {
      const proteinItem = availableProteins[0]; // Pick the first available as primary
      const proteinPerGram = proteinItem.proteinPer100g / 100;
      
      let gramsNeededForProtein = proteinItem.defaultQuantity; // Default fallback
      if (proteinPerGram > 0) {
        gramsNeededForProtein = (mealTargetProtein / proteinPerGram);
      }

      let primaryProteinQuantityForDisplay = proteinItem.defaultQuantity;
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
      availableProteins.slice(1).slice(0, 3).forEach(substitute => {
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
    let availableCarbs = getEligibleFoodsForCategory('carb', mealConfig.key as FoodItem['mealTypes'][number], mealConfig.preferred, addedFoodIds, 'carbs');
    if (availableCarbs.length === 0) {
      console.warn(`No suitable carb found for ${mealConfig.name} based on preferences. Falling back to any carb.`);
      availableCarbs = getEligibleFoodsForCategory('carb', mealConfig.key as FoodItem['mealTypes'][number], [], addedFoodIds, 'carbs'); // Get any carb
    }
    if (availableCarbs.length > 0) {
      const carbItem = availableCarbs[0]; // Pick the first available as primary
      const carbsPerGram = carbItem.carbsPer100g / 100;
      
      let gramsNeededForCarb = carbItem.defaultQuantity; // Default fallback
      if (carbsPerGram > 0) {
        gramsNeededForCarb = (mealTargetCarbs / carbsPerGram);
      }

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
      availableCarbs.slice(1).slice(0, 3).forEach(substitute => {
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
    const additionalPreferredFoods = baseFoodList.filter(item =>
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

        // Only add if it doesn't significantly overshoot the meal's macro targets
        if (meal.totalMealCalories + itemCalories < mealTargetCalories * 1.2 &&
            meal.totalMealProtein + itemProtein < mealTargetProtein * 1.5 &&
            meal.totalMealCarbs + itemCarbs < mealTargetCarbs * 1.5) {
          addItemToMeal(meal, foodItem, quantityToAdd, [], addedFoodIds);
        }
      }
    });

    // --- 4. Adicionar Gordura Saudável (priorizando as preferidas e selecionando aleatoriamente) ---
    let eligibleFats = getEligibleFoodsForCategory('fat', mealConfig.key as FoodItem['mealTypes'][number], preferredFatFoodIds, addedFoodIds, 'fat');

    if (eligibleFats.length > 0 && meal.totalMealFat < mealTargetFat * 0.9) {
      // Prioritize preferred fats, then fall back to any eligible fat
      let fatsToChooseFrom = eligibleFats.filter(fat => preferredFatFoodIds.includes(fat.id));
      if (fatsToChooseFrom.length === 0) {
        fatsToChooseFrom = eligibleFats; // Fallback to any eligible fat if no preferred ones are available
      }

      if (fatsToChooseFrom.length > 0) {
        const randomIndex = Math.floor(Math.random() * fatsToChooseFrom.length);
        const fatItem = fatsToChooseFrom[randomIndex];
        
        const remainingFatGrams = mealTargetFat - meal.totalMealFat;
        
        if (remainingFatGrams > 0 && fatItem.fatPer100g > 0) {
          const gramsNeededForFat = (remainingFatGrams / (fatItem.fatPer100g / 100));
          const quantityToAdd = Math.max(fatItem.defaultQuantity, Math.round(gramsNeededForFat));
          addItemToMeal(meal, fatItem, quantityToAdd, [], addedFoodIds);
        }
      }
    }

    // --- 5. Adicionar Frutas (OBRIGATÓRIO para Café da manhã ou Lanche) ---
    // Tenta adicionar uma fruta no café da manhã ou lanche se ainda não foi adicionada hoje
    if (!fruitAddedToDiet && (mealConfig.key === 'breakfast' || mealConfig.key === 'snack')) {
      let eligibleFruits = getEligibleFoodsForCategory('fruit', mealConfig.key as FoodItem['mealTypes'][number], preferredFruitFoodIds, addedFoodIds, 'carbs');
      
      // Se não houver frutas preferidas elegíveis, tente com qualquer fruta elegível
      if (eligibleFruits.length === 0 && preferredFruitFoodIds.length > 0) {
        console.warn(`No preferred fruits found for ${mealConfig.name}. Falling back to any eligible fruit.`);
        eligibleFruits = getEligibleFoodsForCategory('fruit', mealConfig.key as FoodItem['mealTypes'][number], [], addedFoodIds, 'carbs');
      }

      if (eligibleFruits.length > 0) {
        const randomIndex = Math.floor(Math.random() * eligibleFruits.length);
        const fruitItem = eligibleFruits[randomIndex];

        const estimatedFruitCalories = (fruitItem.caloriesPer100g / 100) * fruitItem.defaultQuantity;
        const estimatedFruitCarbs = (fruitItem.carbsPer100g / 100) * fruitItem.defaultQuantity;

        // Adicionar a fruta, sendo mais flexível com os limites de calorias/carboidratos para garantir a inclusão
        // Apenas se não exceder drasticamente o total da refeição
        if (meal.totalMealCalories + estimatedFruitCalories < mealTargetCalories * 1.5 &&
            meal.totalMealCarbs + estimatedFruitCarbs < mealTargetCarbs * 1.5) {
          addItemToMeal(meal, fruitItem, fruitItem.defaultQuantity, [], addedFoodIds);
          fruitAddedToDiet = true; // Marca que uma fruta foi adicionada
        } else {
          console.warn(`Could not add fruit to ${mealConfig.name} due to calorie/carb limits, even with flexibility.`);
        }
      } else {
        console.warn(`No eligible fruits found for ${mealConfig.name}.`);
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

  // DEBUG: Final values before returning
  console.log("DEBUG: Final currentTotalCalories:", currentTotalCalories);
  console.log("DEBUG: Final currentTotalProtein:", currentTotalProtein);
  console.log("DEBUG: Final currentTotalCarbs:", currentTotalCarbs);
  console.log("DEBUG: Final currentTotalFat:", currentTotalFat);

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