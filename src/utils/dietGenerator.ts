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
    // For substitutions, we assume we're substituting a caloric item.
    // If this path is hit for a substitution, it means the substitute itself has 0 calories, which is unexpected for primary macros.
    return null; // Indicate that a valid calculation isn't possible
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
  const preferredFruitFoodIds = getPreferredFoodIds(foodPreferences.preferredFruits);
  const preferredFatFoodIds = getPreferredFoodIds(foodPreferences.preferredFats);

  const filterFoodItems = (categories: FoodItem['category'][], preferredIds: string[], mealType: FoodItem['mealTypes'][number], excludeIds: string[] = []) => {
    let filtered = foodDatabase.filter(item =>
      categories.some(cat => item.category === cat) && // Use some() for multiple categories
      item.mealTypes.includes(mealType) &&
      !excludeIds.includes(item.id) &&
      item.unit !== 'a gosto' &&
      item.caloriesPer100g > 0 // Only include items with calories for primary selection
    );

    const preferredItems = filtered.filter(item => preferredIds.includes(item.id));
    const otherItems = filtered.filter(item => !preferredIds.includes(item.id));

    return [...preferredItems, ...otherItems];
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

    const addItemToMeal = (foodItem: FoodItem, quantityForCalculation: number, originalItemCalories?: number) => {
      if (quantityForCalculation <= 0 && foodItem.unit !== 'a gosto') return;

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

      const substitutions: string[] = [];
      if (originalItemCalories && (foodItem.category === 'protein' || foodItem.category === 'carb')) {
        const eligibleSubstitutes = foodDatabase.filter(item =>
          item.id !== foodItem.id &&
          item.category === foodItem.category &&
          mealConfig.preferred.includes(item.id) &&
          item.mealTypes.includes(mealConfig.key as FoodItem['mealTypes'][number]) &&
          item.caloriesPer100g > 0
        );

        eligibleSubstitutes.forEach(substitute => {
          const adjustedDetails = calculateAdjustedQuantityAndDetails(substitute, originalItemCalories);
          if (adjustedDetails) {
            substitutions.push(`${substitute.name} (${adjustedDetails.displayQuantity})`);
          }
        });
      }

      meal.items.push({
        food: foodItem.name,
        quantity: displayQuantity,
        substitutions: substitutions,
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

    // 1. Adicionar Proteína Principal (APENAS categoria 'protein')
    const primaryProteins = filterFoodItems(['protein'], mealConfig.preferred, mealConfig.key as FoodItem['mealTypes'][number]);
    if (primaryProteins.length > 0) {
      const proteinItem = primaryProteins[0];
      const gramsNeeded = (mealTargetProtein / (proteinItem.proteinPer100g / 100)) * 0.8; // Aim for 80% of target protein from primary source
      let quantityForCalculation = gramsNeeded;

      if (proteinItem.unit === 'unidade' || proteinItem.unit === 'fatia') {
        quantityForCalculation = Math.round(gramsNeeded / (proteinItem.servingSizeGrams || 1));
        if (quantityForCalculation === 0) quantityForCalculation = 1;
      } else if (proteinItem.unit === 'g' || proteinItem.unit === 'ml') {
        quantityForCalculation = Math.round(gramsNeeded);
      }
      
      const calculatedDetails = calculateAdjustedQuantityAndDetails(proteinItem, (proteinItem.caloriesPer100g / 100) * quantityForCalculation);
      if (calculatedDetails) {
        addItemToMeal(proteinItem, quantityForCalculation, calculatedDetails.calories);
      }
    }

    // 2. Adicionar Carboidrato Principal (APENAS categoria 'carb')
    const primaryCarbs = filterFoodItems(['carb'], mealConfig.preferred, mealConfig.key as FoodItem['mealTypes'][number], addedFoodIds);
    if (primaryCarbs.length > 0) {
      const carbItem = primaryCarbs[0];
      const gramsNeeded = (mealTargetCarbs / (carbItem.carbsPer100g / 100)) * 0.8; // Aim for 80% of target carbs from primary source
      let quantityForCalculation = gramsNeeded;

      if (carbItem.unit === 'unidade' || carbItem.unit === 'fatia') {
        quantityForCalculation = Math.round(gramsNeeded / (carbItem.servingSizeGrams || 1));
        if (quantityForCalculation === 0) quantityForCalculation = 1;
      } else if (carbItem.unit === 'g' || carbItem.unit === 'ml') {
        quantityForCalculation = Math.round(gramsNeeded);
      }

      const calculatedDetails = calculateAdjustedQuantityAndDetails(carbItem, (carbItem.caloriesPer100g / 100) * quantityForCalculation);
      if (calculatedDetails) {
        addItemToMeal(carbItem, quantityForCalculation, calculatedDetails.calories);
      }
    }

    // 3. Adicionar Leguminosas e Laticínios (se preferidos e não adicionados como proteína/carb principal)
    const additionalPreferredFoods = foodDatabase.filter(item =>
      (mealConfig.preferred.includes(item.id)) &&
      (item.category === 'legume' || item.category === 'dairy') &&
      item.mealTypes.includes(mealConfig.key as FoodItem['mealTypes'][number]) &&
      !addedFoodIds.includes(item.id) &&
      item.caloriesPer100g > 0
    );

    additionalPreferredFoods.forEach(foodItem => {
      // Adiciona leguminosas e laticínios como itens adicionais, se houver espaço nos macros
      // e se o item ainda não foi adicionado como principal
      if (!addedFoodIds.includes(foodItem.id)) {
        const quantityToAdd = foodItem.defaultQuantity;
        const itemCalories = (foodItem.caloriesPer100g / 100) * quantityToAdd;
        const itemProtein = (foodItem.proteinPer100g / 100) * quantityToAdd;
        const itemCarbs = (foodItem.carbsPer100g / 100) * quantityToAdd;

        // Only add if it doesn't push macros too far over target
        if (currentMealCalories + itemCalories < mealTargetCalories * 1.2 &&
            currentMealProtein + itemProtein < mealTargetProtein * 1.5 &&
            currentMealCarbs + itemCarbs < mealTargetCarbs * 1.5) {
          addItemToMeal(foodItem, quantityToAdd);
        }
      }
    });

    // 4. Adicionar Gordura Saudável (priorizando as preferidas)
    const eligiblePreferredFats = foodDatabase.filter(item =>
      preferredFatFoodIds.includes(item.id) &&
      item.category === 'fat' &&
      item.mealTypes.includes(mealConfig.key as FoodItem['mealTypes'][number]) &&
      !addedFoodIds.includes(item.id) &&
      item.caloriesPer100g > 0
    );

    if (eligiblePreferredFats.length > 0 && currentMealFat < mealTargetFat * 0.9) {
      const fatItem = eligiblePreferredFats[Math.floor(Math.random() * eligiblePreferredFats.length)];
      const remainingFatCalories = mealTargetFat * 0.9 - currentMealFat;
      const quantityForCalculation = (remainingFatCalories / (fatItem.fatPer100g / 100)) * 0.5; // Use up to 50% of remaining fat target
      
      if (quantityForCalculation > 0) {
        addItemToMeal(fatItem, Math.max(fatItem.defaultQuantity, Math.round(quantityForCalculation)));
      }
    }

    // 5. Adicionar Frutas (priorizando as preferidas)
    const eligiblePreferredFruits = foodDatabase.filter(item =>
      preferredFruitFoodIds.includes(item.id) &&
      item.category === 'fruit' &&
      item.mealTypes.includes(mealConfig.key as FoodItem['mealTypes'][number]) &&
      !addedFoodIds.includes(item.id) &&
      item.id !== 'none_fruits' && // Excluir a opção "Nenhuma fruta"
      item.caloriesPer100g > 0
    );

    if (eligiblePreferredFruits.length > 0 && currentMealCarbs < mealTargetCarbs * 0.9) {
      const fruitItem = eligiblePreferredFruits[0]; // Pega a primeira fruta preferida elegível
      addItemToMeal(fruitItem, fruitItem.defaultQuantity);
    } else if (preferredFruitFoodIds.includes('none_fruits')) {
      // Se o usuário explicitamente não quer frutas, não adiciona
    } else {
      // Fallback para frutas se nenhuma preferida for selecionada ou se as preferidas não forem elegíveis
      const fallbackFruits = foodDatabase.filter(item =>
        item.category === 'fruit' &&
        item.mealTypes.includes(mealConfig.key as FoodItem['mealTypes'][number]) &&
        !addedFoodIds.includes(item.id) &&
        item.id !== 'none_fruits' &&
        item.caloriesPer100g > 0
      );
      if (fallbackFruits.length > 0 && currentMealCarbs < mealTargetCarbs * 0.9) {
        const fruitItem = fallbackFruits[0];
        addItemToMeal(fruitItem, fruitItem.defaultQuantity);
      }
    }

    // 6. Adicionar Vegetais "a gosto"
    const agostos = foodDatabase.filter(item =>
      item.unit === 'a gosto' &&
      item.category === 'vegetable' &&
      item.mealTypes.includes(mealConfig.key as FoodItem['mealTypes'][number]) &&
      !addedFoodIds.includes(item.id)
    );
    agostos.forEach(veggieItem => {
      meal.items.push({
        food: veggieItem.name,
        quantity: 'a gosto',
        substitutions: [],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
      addedFoodIds.push(veggieItem.id);
    });

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