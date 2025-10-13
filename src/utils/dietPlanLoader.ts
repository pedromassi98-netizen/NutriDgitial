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
  // Expected format: [Goal]_[Gender]_[Age]anos_[Weight]kg_[Optional_Restriction].txt
  if (parts.length < 4) {
    console.log('Filename has too few parts:', base); // DEBUG
    return null;
  }

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

  const goalKey = parts[0];
  const genderKey = parts[1];

  const goal = goalMap[goalKey];
  const gender = genderMap[genderKey];
  const age = parseInt(parts[2].replace('anos', ''));
  const weight = parseInt(parts[3].replace('kg', ''));

  const restrictions: string[] = [];
  for (let i = 4; i < parts.length; i++) {
    restrictions.push(parts[i]);
  }

  if (!goal || !gender || isNaN(age) || isNaN(weight)) {
    console.log('Failed to parse metadata from filename:', base, { goal, gender, age, weight }); // DEBUG
    return null;
  }

  return {
    filename: base + '.txt',
    goal,
    gender,
    age,
    weight,
    restrictions,
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
    console.log('Missing formData for diet plan selection.'); // DEBUG
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
    console.log('Checking plan:', plan.filename, { planGoal: plan.goal, userGoal, planGender: plan.gender, userGender }); // DEBUG

    // Filtro básico por objetivo e gênero
    if (plan.goal !== userGoal || plan.gender !== userGender) {
      console.log('Skipping plan due to goal or gender mismatch:', plan.filename); // DEBUG
      continue;
    }

    // Verifica a correspondência de restrições
    let restrictionMatchScore = 0;
    const planRestrictionsLower = plan.restrictions.map(r => r.toLowerCase());
    for (const userRes of userRestrictions) {
      if (planRestrictionsLower.includes(userRes.replace(/ /g, ''))) { // Remove espaços para correspondência
        restrictionMatchScore += 1;
      }
    }

    // Se o usuário tem restrições, prioriza planos com restrições correspondentes
    // Se o usuário tem restrições e o plano não tem nenhuma correspondência, pula este plano
    if (userRestrictions.length > 0 && restrictionMatchScore === 0) {
      console.log('Skipping plan due to restriction mismatch:', plan.filename); // DEBUG
      continue;
    }

    // Calcula a diferença para idade e peso
    const ageDiff = Math.abs(plan.age - userAge);
    const weightDiff = Math.abs(plan.weight - userWeight);
    
    // Pondera a diferença, dando um bônus para correspondências de restrição
    // Multiplicar por um fator maior para restrições garante que planos com restrições correspondentes sejam preferidos
    const currentDifference = ageDiff + weightDiff - (restrictionMatchScore * 50); 

    console.log('Plan:', plan.filename, 'Age Diff:', ageDiff, 'Weight Diff:', weightDiff, 'Restriction Score:', restrictionMatchScore, 'Total Diff:', currentDifference); // DEBUG

    if (currentDifference < minDifference) {
      minDifference = currentDifference;
      bestMatch = plan;
    }
  }
  console.log('Best match found:', bestMatch?.filename); // DEBUG
  return bestMatch;
};

export const parseDietPlanText = (text: string): Meal[] => {
  const meals: Meal[] = [];
  // Divide o texto em seções de refeição, usando a regex para encontrar o início de cada nova refeição
  const mealSections = text.split(/(?=^#\s)/gm).filter(Boolean);

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