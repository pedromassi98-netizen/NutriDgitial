"use client";

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import {
  AllFormData,
  calculateBMR,
  calculateTDEE,
  adjustCaloriesForGoal,
  calculateWaterIntake,
  generateMealPlan,
  Meal,
} from "@/utils/dietCalculations";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const DietPlanPage = () => {
  const navigate = useNavigate();
  const [dietPlan, setDietPlan] = useState<Meal[]>([]);
  const [totalCalories, setTotalCalories] = useState<number | null>(null);
  const [waterIntake, setWaterIntake] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dietPlanRef = useRef<HTMLDivElement>(null); // Ref para o conteúdo da dieta

  useEffect(() => {
    const loadDietData = () => {
      try {
        const storedData = localStorage.getItem("nutriDigitalFormData");
        if (!storedData) {
          setError("Nenhum dado de usuário encontrado. Por favor, preencha os formulários.");
          setLoading(false);
          return;
        }

        const formData: AllFormData = JSON.parse(storedData);

        const { profile, activity, goals, routine, foodPreferences } = formData;

        if (!profile || !activity || !goals || !routine || !foodPreferences) {
          setError("Dados incompletos para gerar a dieta. Por favor, preencha todos os formulários.");
          setLoading(false);
          return;
        }

        // 1. Calcular BMR
        const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);

        // 2. Calcular TDEE
        const tdee = calculateTDEE(bmr, activity.trainingLevel);

        // 3. Ajustar calorias para o objetivo
        const adjustedCalories = Math.round(adjustCaloriesForGoal(tdee, goals.goal));
        setTotalCalories(adjustedCalories);

        // 4. Calcular ingestão de água
        const requiredWater = Math.round(calculateWaterIntake(profile.weight) / 1000); // em litros
        setWaterIntake(requiredWater);

        // 5. Gerar plano de refeições
        const generatedPlan = generateMealPlan(adjustedCalories, routine, foodPreferences, foodPreferences.dietaryRestrictions || "");
        setDietPlan(generatedPlan);

        setLoading(false);
      } catch (e) {
        console.error("Erro ao carregar dados da dieta:", e);
        setError("Ocorreu um erro ao gerar sua dieta. Tente novamente.");
        setLoading(false);
      }
    };

    loadDietData();
  }, []);

  const handleDownloadPdf = async () => {
    if (dietPlanRef.current) {
      setLoading(true);
      toast({
        title: "Gerando PDF...",
        description: "Por favor, aguarde enquanto preparamos sua dieta para download.",
      });
      try {
        const canvas = await html2canvas(dietPlanRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("minha_dieta_nutridigital.pdf");
        toast({
          title: "PDF Gerado! ✅",
          description: "Sua dieta foi baixada com sucesso.",
        });
      } catch (err) {
        console.error("Erro ao gerar PDF:", err);
        toast({
          title: "Erro ao Gerar PDF ⚠️",
          description: "Não foi possível baixar a dieta. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-primary">Gerando Sua Dieta Personalizada... ⏳</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Estamos calculando tudo para você!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>Por favor, aguarde um momento.</p>
          </CardContent>
        </Card>
        <MadeWithDyad />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-destructive">Erro ao Gerar Dieta ⚠️</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Sua Dieta Personalizada! 🎉</CardTitle>
          <CardDescription className="text-center text-muted-foreground mt-2">
            Aqui está o plano alimentar que criamos para você, baseado nas suas informações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div ref={dietPlanRef} className="p-2"> {/* Conteúdo a ser baixado como PDF */}
            <div className="text-center bg-accent/20 p-4 rounded-md">
              <h3 className="text-xl font-semibold text-foreground mb-2">Resumo da Dieta</h3>
              <p className="text-lg">Calorias Diárias: <span className="font-bold text-primary">{totalCalories} kcal</span></p>
              <p className="text-lg">Ingestão de Água: <span className="font-bold text-primary">{waterIntake} litros/dia</span></p>
            </div>

            <Separator className="my-6" />

            <h3 className="text-2xl font-bold text-center text-primary mb-4">Seu Plano de Refeições</h3>
            <div className="space-y-8">
              {dietPlan.map((meal, index) => (
                <div key={index} className="bg-muted/30 p-4 rounded-lg shadow-sm">
                  <h4 className="text-xl font-semibold text-foreground mb-2">{meal.name} ({meal.time})</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Total da Refeição: <span className="font-bold">{meal.totalMealCalories} kcal</span> | P: <span className="font-bold">{meal.totalMealProtein}g</span> | C: <span className="font-bold">{meal.totalMealCarbs}g</span> | G: <span className="font-bold">{meal.totalMealFat}g</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {meal.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-muted-foreground">
                        <span className="font-medium text-foreground">{item.food}:</span> {item.quantity}
                        <span className="text-sm text-gray-500 ml-2">
                          ({item.calories} kcal, P:{item.protein}g, C:{item.carbs}g, G:{item.fat}g)
                        </span>
                        {item.substitutions && item.substitutions.length > 0 && (
                          <span className="block text-sm text-gray-500 ml-4">
                            (Ou: {item.substitutions.join(", ")})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="text-center text-muted-foreground text-sm">
              <p>Lembre-se: Este é um plano sugerido. Consulte um profissional de saúde para um acompanhamento personalizado.</p>
            </div>
          </div> {/* Fim do conteúdo a ser baixado como PDF */}

          <Button onClick={handleDownloadPdf} className="w-full bg-green-600 text-white hover:bg-green-700 mb-4">
            Baixar Dieta em PDF 📄
          </Button>
          <Button onClick={() => navigate("/")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Voltar ao Início
          </Button>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default DietPlanPage;