export interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'legume' | 'other'; // 'legume' adicionado
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  unit: 'g' | 'ml' | 'unidade' | 'fatia' | 'a gosto'; // Explicit units
  servingSizeGrams?: number; // For 'unidade' or 'fatia' items, how many grams is one unit/slice
  defaultQuantity: number; // This will be the number of units/grams/ml to suggest
  substitutions?: string[]; // IDs of other food items that can substitute this one
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isLactoseFree?: boolean;
  mealTypes: ('breakfast' | 'lunch' | 'snack' | 'dinner')[]; // Nova propriedade
  displayInMealTypeSelection?: boolean; // Nova propriedade para controlar a visibilidade
}

export const foodDatabase: FoodItem[] = [
  // Proteínas
  { id: 'chicken_breast', name: 'Peito de frango', category: 'protein', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'tilapia_fillet', name: 'Filé de tilápia', category: 'protein', caloriesPer100g: 128, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 2.7, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'eggs', name: 'Ovos', category: 'protein', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, unit: 'unidade', servingSizeGrams: 50, defaultQuantity: 2, substitutions: ['mozzarella_cheese'], isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'snack'] }, // 2 unidades = 100g
  { id: 'tofu', name: 'Tofu', category: 'protein', caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatPer100g: 4.8, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'salmon', name: 'Salmão', category: 'protein', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'lean_beef', name: 'Carne magra', category: 'protein', caloriesPer100g: 130, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 3, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'greek_yogurt', name: 'Iogurte grego natural', category: 'protein', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, unit: 'unidade', servingSizeGrams: 100, defaultQuantity: 1, isGlutenFree: true, mealTypes: ['breakfast', 'snack'] }, // 1 unidade = 100g
  { id: 'whey_protein_powder', name: 'Whey Protein em pó', category: 'protein', caloriesPer100g: 370, proteinPer100g: 80, carbsPer100g: 5, fatPer100g: 4, unit: 'g', defaultQuantity: 30, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'snack'] },
  { id: 'mozzarella_cheese', name: 'Queijo Mussarela', category: 'protein', caloriesPer100g: 300, proteinPer100g: 22, carbsPer100g: 1, fatPer100g: 22, unit: 'g', defaultQuantity: 30, isGlutenFree: true, isLactoseFree: false, mealTypes: ['breakfast', 'snack'] }, // Alterado para 'g'
  { id: 'minas_cheese', name: 'Queijo Minas Frescal', category: 'protein', caloriesPer100g: 260, proteinPer100g: 17, carbsPer100g: 2, fatPer100g: 20, unit: 'g', defaultQuantity: 40, isGlutenFree: true, isLactoseFree: false, mealTypes: ['breakfast', 'snack'] }, // Alterado para 'g'
  { id: 'light_cream_cheese', name: 'Requeijão Light', category: 'protein', caloriesPer100g: 100, proteinPer100g: 10, carbsPer100g: 4, fatPer100g: 5, unit: 'g', defaultQuantity: 30, isGlutenFree: true, isLactoseFree: false, mealTypes: ['breakfast', 'snack'] },
  { id: 'ricotta_cream', name: 'Creme de Ricota Light', category: 'protein', caloriesPer100g: 120, proteinPer100g: 8, carbsPer100g: 3, fatPer100g: 8, unit: 'g', defaultQuantity: 30, isGlutenFree: true, isLactoseFree: false, mealTypes: ['breakfast', 'snack'] },
  { id: 'canned_tuna_water', name: 'Atum em lata ao natural', category: 'protein', caloriesPer100g: 116, proteinPer100g: 25.5, carbsPer100g: 0, fatPer100g: 1.3, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'soy', name: 'Soja (cozida)', category: 'protein', caloriesPer100g: 147, proteinPer100g: 13, carbsPer100g: 9.9, fatPer100g: 6.8, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'cottage_cheese', name: 'Queijo Cottage', category: 'protein', caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: false, mealTypes: ['breakfast', 'snack'] },

  // Carboidratos
  { id: 'sweet_potato', name: 'Batata doce', category: 'carb', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'brown_rice', name: 'Arroz integral', category: 'carb', caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  {
    id: 'arroz_branco',
    name: 'Arroz Branco Cozido',
    category: 'carb',
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28,
    fatPer100g: 0.3,
    unit: 'g',
    defaultQuantity: 150,
    isGlutenFree: true,
    isLactoseFree: true,
    mealTypes: ['lunch', 'dinner']
  },
  { id: 'oats', name: 'Aveia', category: 'carb', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatPer100g: 6.9, unit: 'g', defaultQuantity: 50, isLactoseFree: true, mealTypes: ['breakfast', 'snack'] },
  { id: 'whole_wheat_bread', name: 'Pão integral', category: 'carb', caloriesPer100g: 265, proteinPer100g: 13, carbsPer100g: 49, fatPer100g: 3.6, unit: 'fatia', servingSizeGrams: 30, defaultQuantity: 2, isLactoseFree: true, mealTypes: ['breakfast', 'snack'] }, // 2 fatias = 60g
  { id: 'tapioca', name: 'Tapioca', category: 'carb', caloriesPer100g: 240, proteinPer100g: 0.6, carbsPer100g: 59, fatPer100g: 0, unit: 'g', defaultQuantity: 50, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'snack'] },
  { id: 'whole_wheat_pasta', name: 'Macarrão integral', category: 'carb', caloriesPer100g: 124, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1, unit: 'g', defaultQuantity: 100, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'french_bread', name: 'Pão francês', category: 'carb', caloriesPer100g: 280, proteinPer100g: 8, carbsPer100g: 56, fatPer100g: 2, unit: 'unidade', servingSizeGrams: 50, defaultQuantity: 1, substitutions: ['whole_wheat_bread', 'sandwich_bread'], isGlutenFree: false, isLactoseFree: true, mealTypes: ['breakfast', 'snack'] }, // 1 unidade = 50g
  { id: 'boiled_potato', name: 'Batata inglesa cozida', category: 'carb', caloriesPer100g: 52, proteinPer100g: 1.5, carbsPer100g: 12, fatPer100g: 0.1, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] }, // Valores atualizados
  { id: 'boiled_pasta', name: 'Macarrão cozido', category: 'carb', caloriesPer100g: 158, proteinPer100g: 5.8, carbsPer100g: 30.6, fatPer100g: 0.9, unit: 'g', defaultQuantity: 100, isGlutenFree: false, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'cassava', name: 'Mandioca cozida', category: 'carb', caloriesPer100g: 160, proteinPer100g: 1.4, carbsPer100g: 38, fatPer100g: 0.3, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'sandwich_bread', name: 'Pão de forma', category: 'carb', caloriesPer100g: 260, proteinPer100g: 8, carbsPer100g: 49, fatPer100g: 3, unit: 'fatia', servingSizeGrams: 25, defaultQuantity: 2, isGlutenFree: false, isLactoseFree: true, mealTypes: ['breakfast', 'snack'] },
  { id: 'batata_baroa', name: 'Batata Baroa (Mandioquinha)', category: 'carb', caloriesPer100g: 80, proteinPer100g: 1.0, carbsPer100g: 19, fatPer100g: 0.2, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'cuscuz_milho', name: 'Cuscuz de Milho', category: 'carb', caloriesPer100g: 113, proteinPer100g: 3.0, carbsPer100g: 24, fatPer100g: 0.5, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'snack'] },

  // Gorduras - ATUALIZADO
  { id: 'avocado', name: 'Abacate', category: 'fat', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, unit: 'g', defaultQuantity: 50, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'olive_oil', name: 'Azeite de oliva extra virgem', category: 'fat', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, unit: 'ml', defaultQuantity: 10, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'nuts', name: 'Castanhas (mix)', category: 'fat', caloriesPer100g: 607, proteinPer100g: 15, carbsPer100g: 18, fatPer100g: 54, unit: 'g', defaultQuantity: 30, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'] },
  { id: 'chia_seeds', name: 'Sementes de chia', category: 'fat', caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31, unit: 'g', defaultQuantity: 15, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'] },
  { id: 'sunflower_seeds', name: 'Sementes de girassol', category: 'fat', caloriesPer100g: 584, proteinPer100g: 20.7, carbsPer100g: 20, fatPer100g: 51.5, unit: 'g', defaultQuantity: 15, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'] }, // Adicionado 'lunch', 'dinner'
  { id: 'flax_seeds', name: 'Sementes de linhaça', category: 'fat', caloriesPer100g: 534, proteinPer100g: 18.3, carbsPer100g: 28.9, fatPer100g: 42.2, unit: 'g', defaultQuantity: 15, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'] }, // Adicionado 'lunch', 'dinner'

  // Vegetais (A GOSTO)
  { id: 'broccoli', name: 'Brócolis', category: 'vegetable', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'spinach', name: 'Espinafre', category: 'vegetable', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'carrots', name: 'Cenoura', category: 'vegetable', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 9.6, fatPer100g: 0.2, unit: 'a gosto', defaultQuantity: 0, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'lettuce', name: 'Alface', category: 'vegetable', caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, unit: 'a gosto', defaultQuantity: 0, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'tomato', name: 'Tomate', category: 'vegetable', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, unit: 'a gosto', defaultQuantity: 0, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'kale', name: 'Couve', category: 'vegetable', caloriesPer100g: 49, proteinPer100g: 4.3, carbsPer100g: 8.8, fatPer100g: 0.9, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'zucchini', name: 'Abobrinha', category: 'vegetable', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'cauliflower', name: 'Couve-flor', category: 'vegetable', caloriesPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5.0, fatPer100g: 0.3, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'chayote', name: 'Chuchu', category: 'vegetable', caloriesPer100g: 19, proteinPer100g: 0.8, carbsPer100g: 4.5, fatPer100g: 0.1, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'cucumber', name: 'Pepino', category: 'vegetable', caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, unit: 'a gosto', defaultQuantity: 0, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'beetroot', name: 'Beterraba', category: 'vegetable', caloriesPer100g: 43, proteinPer100g: 1.6, carbsPer100g: 9.6, fatPer100g: 0.2, unit: 'a gosto', defaultQuantity: 0, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },

  // Frutas
  { id: 'apple', name: 'Maçã', category: 'fruit', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, unit: 'unidade', servingSizeGrams: 180, defaultQuantity: 1, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false }, // 1 unidade = 180g
  { id: 'banana', name: 'Banana', category: 'fruit', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, unit: 'unidade', servingSizeGrams: 120, defaultQuantity: 1, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false }, // 1 unidade = 120g
  { id: 'berries', name: 'Frutas vermelhas (mix)', category: 'fruit', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.5, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'orange', name: 'Laranja', category: 'fruit', caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, unit: 'unidade', servingSizeGrams: 130, defaultQuantity: 1, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false }, // 1 unidade = 130g
  { id: 'pineapple', name: 'Abacaxi', category: 'fruit', caloriesPer100g: 50, proteinPer100g: 0.4, carbsPer100g: 12.6, fatPer100g: 0.1, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'papaya', name: 'Mamão', category: 'fruit', caloriesPer100g: 40, proteinPer100g: 0.5, carbsPer100g: 10.4, fatPer100g: 0.1, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'strawberry', name: 'Morango', category: 'fruit', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'watermelon', name: 'Melancia', category: 'fruit', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 7.6, fatPer100g: 0.2, unit: 'g', defaultQuantity: 150, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'melon', name: 'Melão', category: 'fruit', caloriesPer100g: 34, proteinPer100g: 0.8, carbsPer100g: 8.2, fatPer100g: 0.2, unit: 'g', defaultQuantity: 150, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'uva', name: 'Uva', category: 'fruit', caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'mango', name: 'Manga', category: 'fruit', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, unit: 'g', defaultQuantity: 150, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'pear', name: 'Pera', category: 'fruit', caloriesPer100g: 57, proteinPer100g: 0.4, carbsPer100g: 15, fatPer100g: 0.1, unit: 'unidade', servingSizeGrams: 170, defaultQuantity: 1, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'kiwi', name: 'Kiwi', category: 'fruit', caloriesPer100g: 61, proteinPer100g: 1.1, carbsPer100g: 15, fatPer100g: 0.5, unit: 'unidade', servingSizeGrams: 70, defaultQuantity: 1, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'peach', name: 'Pêssego', category: 'fruit', caloriesPer100g: 39, proteinPer100g: 0.9, carbsPer100g: 9.5, fatPer100g: 0.3, unit: 'unidade', servingSizeGrams: 150, defaultQuantity: 1, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'plum', name: 'Ameixa', category: 'fruit', caloriesPer100g: 46, proteinPer100g: 0.7, carbsPer100g: 11.4, fatPer100g: 0.3, unit: 'unidade', servingSizeGrams: 60, defaultQuantity: 1, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'lunch', 'snack', 'dinner'], displayInMealTypeSelection: false },
  { id: 'none_fruits', name: 'Nenhuma fruta', category: 'fruit', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, unit: 'a gosto', defaultQuantity: 0, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: [], displayInMealTypeSelection: false },

  // Leguminosas - NOVA CATEGORIA
  { id: 'lentils', name: 'Lentilha', category: 'legume', caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'beans', name: 'Feijão cozido', category: 'legume', 'caloriesPer100g': 100, proteinPer100g: 7, carbsPer100g: 18, fatPer100g: 0.5, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'quinoa', name: 'Quinoa', category: 'legume', caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9, unit: 'g', defaultQuantity: 100, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },
  { id: 'chickpeas', name: 'Grão de Bico', category: 'legume', caloriesPer100g: 164, proteinPer100g: 8.9, carbsPer100g: 27.4, fatPer100g: 2.6, unit: 'g', defaultQuantity: 100, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['lunch', 'dinner'] },

  // Laticínios (além do iogurte grego)
  { id: 'milk_lactose_free', name: 'Leite sem lactose', category: 'dairy', caloriesPer100g: 47, proteinPer100g: 3.2, carbsPer100g: 4.7, fatPer100g: 1.5, unit: 'ml', defaultQuantity: 200, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'snack'] },
  { id: 'almond_milk', name: 'Leite de amêndoas', category: 'dairy', caloriesPer100g: 15, proteinPer100g: 0.6, carbsPer100g: 1.6, fatPer100g: 1.1, unit: 'ml', defaultQuantity: 200, isVegetarian: true, isVegan: true, isGlutenFree: true, isLactoseFree: true, mealTypes: ['breakfast', 'snack'] },
  { id: 'whole_milk', name: 'Leite Integral', category: 'dairy', caloriesPer100g: 60, proteinPer100g: 3.2, carbsPer100g: 4.7, fatPer100g: 3.3, unit: 'ml', defaultQuantity: 200, isGlutenFree: true, isLactoseFree: false, mealTypes: ['breakfast', 'snack'] },
  { id: 'natural_yogurt', name: 'Iogurte Natural Integral', category: 'dairy', caloriesPer100g: 60, proteinPer100g: 4.1, carbsPer100g: 4.7, fatPer100g: 3.3, unit: 'unidade', servingSizeGrams: 170, defaultQuantity: 1, isGlutenFree: true, isLactoseFree: false, mealTypes: ['breakfast', 'snack'] }, // 1 unidade = 170g
];