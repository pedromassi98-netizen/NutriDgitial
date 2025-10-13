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
  // Divide o texto em seções de refeição, usando a regex para encontrar o início de cada nova refeição
  const mealSections = text.split(/(?=^#\s)/gm).filter(Boolean);
  console.log('Meal sections found:', mealSections.length); // DEBUG

  mealSections.forEach(section => {
    const lines = section.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // Extrai o nome e o horário da refeição do cabeçalho
    const mealHeaderMatch = lines[0].match(/^#\s(.+)\s\((\d{2}:\d{2})\)$/);
    if (!mealHeaderMatch) {
      console.log('Failed to parse meal header:', lines[0]); // DEBUG
      return;
    }

    const mealName = mealHeaderMatch[1];
    const mealTime = mealHeaderMatch[2];
    const items: MealItemDetails[] = [];
    let totalMealCalories = 0;
    let totalMealProtein = 0;
    let totalMealCarbs = 0;
    let totalMealFat = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Verifica se é a linha de total da refeição
      if (line.startsWith('Total da Refeição:')) {
        const totalMatch = line.match(/Total da Refeição:\s*(\d+)\s*kcal\s*\|\s*P:(\d+)g\s*\|\s*C:(\d+)g\s*\|\s*G:(\d+)g/);
        if (totalMatch) {
          totalMealCalories = parseInt(totalMatch[1]);
          totalMealProtein = parseInt(totalMatch[2]);
          totalMealCarbs = parseInt(totalMatch[3]);
          totalMealFat = parseInt(totalMatch[4]);
        }
        break; // Termina de processar os itens da refeição
      }

      // Extrai os detalhes de cada item da refeição
      const itemMatch = line.match(/-\s*(.+?):\s*(.+?)\s*\((\d+)\s*kcal,\s*P:(\d+)g,\s*C:(\d+)g,\s*G:(\d+)g\)\s*(?:\(Ou:\s*(.+)\))?/);
      if (itemMatch) {
        const food = itemMatch[1];
        const quantity = itemMatch[2];
        const calories = parseInt(itemMatch[3]);
        const protein = parseInt(itemMatch[4]);
        const carbs = parseInt(itemMatch[5]);
        const fat = parseInt(itemMatch[6]);
        const substitutions = itemMatch[7] ? itemMatch[7].split(',').map(s => s.trim()) : [];

        items.push({
          food,
          quantity,
          calories,
          protein,
          carbs,
          fat,
          substitutions,
        });
      } else {
        console.log('Failed to parse meal item line:', line); // DEBUG
      }
    }

    meals.push({
      name: mealName,
      time: mealTime,
      items,
      totalMealCalories,
      totalMealProtein,
      totalMealCarbs,
      totalMealFat,
    });
  });
  console.log('Parsed meals:', meals); // DEBUG
  return meals;
};