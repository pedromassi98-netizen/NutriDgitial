export interface SupplementItem {
  id: string;
  name: string;
  recommendedDosagePerKg?: number; // e.g., mg/kg for creatine, g/kg for protein (though whey is excluded)
  fixedDosage?: string; // e.g., "1 cápsula", "5g"
  unit: string; // e.g., "mg", "g", "cápsula"
  goals: string[]; // IDs from supplementationGoalsOptions
  notes?: string; // Additional usage notes
}

export const supplementDatabase: SupplementItem[] = [
  {
    id: 'creatine',
    name: 'Creatina',
    recommendedDosagePerKg: 0.05, // 50mg/kg (or 0.05g/kg)
    unit: 'g',
    goals: ['muscle_gain', 'energy', 'recovery'],
    notes: 'Tomar diariamente, preferencialmente após o treino ou em qualquer horário do dia. Não é necessário ciclar.',
  },
  {
    id: 'caffeine',
    name: 'Cafeína',
    fixedDosage: '100-200mg', // Common fixed dosage
    unit: 'mg',
    goals: ['energy'],
    notes: 'Tomar 30-60 minutos antes do treino. Evitar próximo ao horário de dormir.',
  },
  {
    id: 'multivitamin',
    name: 'Multivitamínico',
    fixedDosage: '1 cápsula',
    unit: 'cápsula',
    goals: ['health', 'recovery'],
    notes: 'Tomar com uma das principais refeições.',
  },
  {
    id: 'bcaa',
    name: 'BCAA',
    recommendedDosagePerKg: 0.1, // 100mg/kg (or 0.1g/kg)
    unit: 'g',
    goals: ['muscle_gain', 'recovery'],
    notes: 'Tomar antes, durante ou após o treino.',
  },
  {
    id: 'omega_3',
    name: 'Ômega 3',
    fixedDosage: '1000-2000mg', // Common fixed dosage
    unit: 'mg',
    goals: ['health', 'recovery'],
    notes: 'Tomar com as refeições principais.',
  },
  {
    id: 'pre_workout',
    name: 'Pré-treino',
    fixedDosage: '1 dose',
    unit: 'dose',
    goals: ['energy', 'muscle_gain'],
    notes: 'Tomar 30 minutos antes do treino. Seguir as instruções do fabricante.',
  },
];