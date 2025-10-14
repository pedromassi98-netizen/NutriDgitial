import { AllFormData } from "./dietCalculations";
import { supplementDatabase, SupplementItem } from "../data/supplementDatabase";

export interface RecommendedSupplement {
  name: string;
  dosage: string;
  notes?: string;
  reason: string;
}

export const getSupplementRecommendations = (formData: AllFormData): RecommendedSupplement[] => {
  const { profile, supplementation } = formData;
  const recommendations: RecommendedSupplement[] = [];

  if (!profile || !supplementation || supplementation.wantsToToUseSupplements !== 'yes') {
    return []; // No recommendations if user doesn't want to use supplements or data is missing
  }

  const userWeight = profile.weight;
  const userGoals = supplementation.supplementationGoals || [];
  const otherGoals = supplementation.otherSupplementationGoals;

  // Filter out supplements the user is already taking (if 'usesSupplements' is 'yes')
  const currentSupplements = supplementation.usesSupplements === 'yes'
    ? supplementation.currentSupplements || []
    : [];

  // Exclude Whey Protein as per user request
  const excludedSupplements = [...currentSupplements, 'whey_protein'];

  for (const supp of supplementDatabase) {
    if (excludedSupplements.includes(supp.id)) {
      continue; // Skip if user is already taking it or it's whey protein
    }

    // Check if any of the user's goals match the supplement's goals
    const matchingGoals = userGoals.filter(goal => supp.goals.includes(goal));
    const hasOtherGoalMatch = otherGoals && supp.notes && supp.notes.toLowerCase().includes(otherGoals.toLowerCase()); // Simple match for 'other' goal

    if (matchingGoals.length > 0 || hasOtherGoalMatch) {
      let dosage = '';
      if (supp.fixedDosage) {
        dosage = supp.fixedDosage;
      } else if (supp.recommendedDosagePerKg && userWeight) {
        const calculatedDosage = userWeight * supp.recommendedDosagePerKg;
        dosage = `${Math.round(calculatedDosage)} ${supp.unit}`;
      } else {
        dosage = `Consultar profissional (${supp.unit})`; // Fallback
      }

      recommendations.push({
        name: supp.name,
        dosage: dosage,
        notes: supp.notes,
        reason: matchingGoals.length > 0 ? `Para ${matchingGoals.map(g => {
          switch(g) {
            case 'muscle_gain': return 'ganho de massa muscular';
            case 'weight_loss': return 'emagrecimento';
            case 'energy': return 'mais energia';
            case 'recovery': return 'melhora na recuperação';
            case 'health': return 'saúde geral';
            default: return g;
          }
        }).join(', ')}` : 'Objetivo específico',
      });
    }
  }

  return recommendations;
};