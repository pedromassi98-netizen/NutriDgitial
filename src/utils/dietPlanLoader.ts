import { AllFormData, Meal, MealItemDetails } from "./dietCalculations";

// Importa todos os arquivos .txt da pasta diet-plans como texto bruto
const dietPlanFiles = import.meta.glob('../data/diet-plans/*.txt', { as: 'raw', eager: true });
console.log('Loaded diet plan files:', Object.keys(dietPlanFiles)); // DEBUG

interface DietPlanMetadata {
  filename: string;
  goal: string;
  gender: string;
  age: number;
  weight: number;
  restrictions: string[];
  content: string;
}

const parseFilename = (filename: string): Omit<DietPlanMetadata, 'content'> | null => {
  const base = filename.split('/').pop()?.replace('.txt', '');
  if (!base) {
    console.log('Failed to get base filename for:', filename); // DEBUG
    return null;
  }

  const parts = base.split('_');
  
  const goalMap: { [key: string]: AllFormData['goals']['goal'] } = {
    "Bulking": "bulking",
    "Emagrecimento": "weight_loss",
    "Ganho_de_massa": "muscle_gain",
    "Manutencao": "maintenance",
    "Perda_de_gordura": "cutting",
    "Ser_saudavel": "healthy_eating",
  };

  const genderMap: { [key: string]: AllFormData['profile']['gender'] } = {
    "Masc": "male",
    "Fem": "female",
  };

  let parsedGoal: AllFormData['goals']['goal'] | undefined;
  let parsedGender: AllFormData['profile']['gender'] | undefined;
  let parsedAge: number | undefined;
  let parsedWeight: number | undefined;
  const parsedRestrictions: string[] = [];

  for (const part of parts) {
    if (goalMap[part] && !parsedGoal) {
      parsedGoal = goalMap[part];
    } else if (genderMap[part] && !parsedGender) {
      parsedGender = genderMap[part];
    } else if (part.includes('anos') && !parsedAge) {
      parsedAge = parseInt(part.replace('anos', ''));
    } else if (part.includes('kg') && !parsedWeight) {
      parsedWeight = parseInt(part.replace('kg', ''));
    } else {
      // Assume it's a restriction if it doesn't match other patterns
      parsedRestrictions.push(part);
    }
  }

  if (!parsedGoal || !parsedGender || isNaN(parsedAge || 0) || isNaN(parsedWeight || 0)) {
    console.log('Failed to parse metadata from filename:', base, { parsedGoal, parsedGender, parsedAge, parsedWeight }); // DEBUG
    return null;
  }

  return {
    filename: base + '.txt',
    goal: parsedGoal,
    gender: parsedGender,
    age: parsedAge!,
    weight: parsedWeight!,
    restrictions: parsedRestrictions,
  };
};

// Carrega e processa os metadados de todos os planos de dieta
const allDietPlansMetadata: DietPlanMetadata[] = Object.entries(dietPlanFiles)
  .map(([path, content]) => {
    const metadata = parseFilename(path);
    return metadata ? { ...metadata, content } : null;
  })
  .filter((m): m is DietPlanMetadata => m !== null);

console.log('Parsed diet plans metadata:', allDietPlansMetadata); // DEBUG

export const selectBestDietPlan = (formData: AllFormData): DietPlanMetadata | null => {
  const { profile, goals, foodPreferences } = formData;
  if (!profile || !goals || !foodPreferences) {
    console.log('Missing formData for diet plan selection. Cannot select diet plan.'); // DEBUG
    return null;
  }

  let bestMatch: DietPlanMetadata | null = null;
  let minDifference = Infinity;

  const userGoal = goals.goal;
  const userGender = profile.gender;
  const userAge = profile.age;
  const userWeight = profile.weight;
  const userRestrictions = foodPreferences.dietaryRestrictions?.toLowerCase().split(',').map(s => s.trim()).filter(Boolean) || [];

  console.log('User data for diet selection:', { userGoal, userGender, userAge, userWeight, userRestrictions }); // DEBUG

  for (const plan of allDietPlansMetadata) {
    console.log('Evaluating plan:', plan.filename); // DEBUG
    console.log('  Plan Goal:', plan.goal, 'User Goal:', userGoal); // DEBUG
    console.log('  Plan Gender:', plan.gender, 'User Gender:', userGender); // DEBUG

    // Strict filter by objective and gender
    if (plan.goal !== userGoal || plan.gender !== userGender) {
      console.log('  Skipping plan due to goal or gender mismatch.'); // DEBUG
      continue;
    }

    // Check restriction match
    let restrictionMatchScore = 0;
    const planRestrictionsLower = plan.restrictions.map(r => r.toLowerCase());
    console.log('  Plan Restrictions:', planRestrictionsLower); // DEBUG
    for (const userRes of userRestrictions) {
      // Ensure user restriction is also normalized (e.g., "low carb" -> "lowcarb")
      const normalizedUserRes = userRes.replace(/ /g, '');
      if (planRestrictionsLower.includes(normalizedUserRes)) {
        restrictionMatchScore += 1;
      }
    }
    console.log('  User Restrictions:', userRestrictions, 'Restriction Match Score:', restrictionMatchScore); // DEBUG

    // If user has restrictions, but this plan has no matching restrictions, skip it.
    // This ensures that if a user specifies a restriction, we only consider plans that explicitly cater to it.
    if (userRestrictions.length > 0 && restrictionMatchScore === 0) {
      console.log('  Skipping plan: User has restrictions, but this plan has no matching restrictions.'); // DEBUG
      continue;
    }

    // Calculate age and weight difference
    const ageDiff = Math.abs(plan.age - userAge);
    const weightDiff = Math.abs(plan.weight - userWeight);
    
    // Weight the difference, giving a bonus for restriction matches
    const currentDifference = ageDiff + weightDiff - (restrictionMatchScore * 50); 

    console.log('  Age Diff:', ageDiff, 'Weight Diff:', weightDiff, 'Restriction Score:', restrictionMatchScore, 'Total Diff:', currentDifference); // DEBUG

    if (currentDifference < minDifference) {
      minDifference = currentDifference;
      bestMatch = plan;
      console.log('  New best match:', bestMatch.filename, 'with difference:', minDifference); // DEBUG
    }
  }
  console.log('Final best match found:', bestMatch?.filename, 'with minDifference:', minDifference); // DEBUG
  return bestMatch;
};

export const parseDietPlanText = (text: string): Meal[] => {
  const meals: Meal[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log('All lines from diet plan text:', lines); // DEBUG

  let currentMeal: Meal | null = null;

  for (const line of lines) {
    // Regex para identificar o cabeçalho da refeição (ex: "# Café da manhã (07:00)")
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
      // Ignora linhas antes do primeiro cabeçalho de refeição (ex: Perfil, Peso, etc.)
      continue;
    }

    // Regex para identificar calorias da refeição (ex: "Calorias: ~430 kcal")
    const caloriesMatch = line.match(/^Calorias:\s*~?(\d+)\s*kcal$/);
    if (caloriesMatch) {
      currentMeal.totalMealCalories = parseInt(caloriesMatch[1]);
      console.log('Found meal calories:', currentMeal.totalMealCalories); // DEBUG
      continue;
    }

    // Regex para identificar substituições (ex: "Substituições: ovos por 30g whey; pão por 50g tapioca.")
    const substitutionsMatch = line.match(/^Substituições:\s*(.+)$/);
    if (substitutionsMatch) {
      // Adiciona as substituições ao último item da refeição, se houver
      if (currentMeal.items.length > 0) {
        const lastItem = currentMeal.items[currentMeal.items.length - 1];
        lastItem.substitutions = substitutionsMatch[1].split(';').map(s => s.trim()).filter(Boolean);
        console.log('Found substitutions for last item:', lastItem.substitutions); // DEBUG
      }
      continue;
    }

    // Regex para identificar itens da refeição (ex: "- 200g de batata doce cozida")
    // E definir macros como 0, já que não estão detalhados por item no TXT
    const itemMatch = line.match(/^- (.+)$/);
    if (itemMatch) {
      const foodItem: MealItemDetails = {
        food: itemMatch[1], // A linha inteira após o hífen como descrição do alimento
        quantity: "a gosto", // Quantidade padrão, pois não é especificada por item
        substitutions: [],
        calories: 0, // Não especificado por item
        protein: 0,  // Não especificado por item
        carbs: 0,    // Não especificado por item
        fat: 0,      // Não especificado por item
      };
      currentMeal.items.push(foodItem);
      console.log('Found meal item:', foodItem.food); // DEBUG
      continue;
    }
    
    // Ignora outras linhas que não são relevantes para o parsing da dieta
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