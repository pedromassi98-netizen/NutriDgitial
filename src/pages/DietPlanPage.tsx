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
import { UtensilsCrossed, Droplet, Download, Mail } from "lucide-react"; // Importar ícones
import { supabase } from "@/integrations/supabase/client"; // Importar o cliente Supabase

const DietPlanPage = () => {
  const navigate = useNavigate();
  const [dietPlan, setDietPlan] = useState<Meal[]>([]);
  const [totalCalories, setTotalCalories] = useState<number | null>(null);
  const [waterIntake, setWaterIntake] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const dietPlanRef = useRef<HTMLDivElement>(null); // Ref para o conteúdo da dieta

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

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

        const { welcome, profile, activity, goals, routine, foodPreferences } = formData;

        if (!welcome || !profile || !activity || !goals || !routine || !foodPreferences) {
          setError("Dados incompletos para gerar a dieta. Por favor, preencha todos os formulários.");
          setLoading(false);
          return;
        }

        setUserEmail(welcome.email);
        setUserName(welcome.name);

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

  const generatePdf = async () => {
    if (!dietPlanRef.current) return null;

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

    return pdf;
  };

  const handleDownloadPdf = async () => {
    if (dietPlanRef.current) {
      setLoading(true);
      toast({
        title: "Gerando PDF...",
        description: "Por favor, aguarde enquanto preparamos sua dieta para download.",
      });
      try {
        const pdf = await generatePdf();
        if (pdf) {
          pdf.save("minha_dieta_nutridigital.pdf");
          toast({
            title: "PDF Gerado! ✅",
            description: "Sua dieta foi baixada com sucesso.",
          });
        }
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

  const handleSendEmail = async () => {
    if (!userEmail || !userName) {
      toast({
        title: "Erro ao enviar e-mail",
        description: "Não foi possível encontrar o e-mail ou nome do usuário.",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    toast({
      title: "Enviando e-mail...",
      description: "Por favor, aguarde enquanto enviamos sua dieta.",
    });

    try {
      const pdf = await generatePdf();
      if (!pdf) {
        throw new Error("Não foi possível gerar o PDF para envio.");
      }
      const pdfBase64 = pdf.output('datauristring').split(',')[1]; // Get base64 string

      console.log("PDF Base64 size:", pdfBase64.length / 1024 / 1024, "MB"); // Log PDF size

      const { data, error: edgeFunctionError } = await supabase.functions.invoke('send-diet-email', {
        body: { userEmail, pdfBase64, userName },
      });

      if (edgeFunctionError) {
        throw edgeFunctionError;
      }

      console.log("Email sent response:", data);
      toast({
        title: "E-mail Enviado! 📧",
        description: `Sua dieta foi enviada para ${userEmail}.`,
      });
    } catch (err: any) { // Explicitly type err as any to access .message
      console.error("Erro ao enviar e-mail:", err);
      toast({
        title: "Erro ao Enviar E-mail ⚠️",
        description: `Não foi possível enviar a dieta para ${userEmail}. Erro: ${err.message || err}`,
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
        <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
          <CardHeader className="bg-primary-subtle rounded-t-xl p-6 de text-center">
            <CardTitle className="text-3xl font-extrabold text-primary">Gerando Sua Dieta Personalizada...</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Estamos calculando tudo para você!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <p className="text-lg">Por favor, aguarde um momento.</p>
          </CardContent>
        </Card>
        <MadeWithDyad />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
        <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
          <CardHeader className="bg-primary-subtle rounded-t-xl p-6 text-center">
            <CardTitle className="text-3xl font-extrabold text-primary">Erro ao Gerar Dieta ⚠️</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <Button onClick={() => navigate("/")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 text-lg font-semibold">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
      <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-primary-subtle rounded-t-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <UtensilsCrossed className="size-8 text-primary mr-2" />
            <CardTitle className="text-3xl font-extrabold text-primary">Sua Dieta Personalizada!</CardTitle>
          </div>
          <CardDescription className="text-center text-muted-foreground mt-2">
            Aqui está o plano alimentar que criamos para você, baseado nas suas informações.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div ref={dietPlanRef} className="p-4"> {/* Adicionado p-4 aqui */}
            <div className="text-center bg-info p-4 rounded-md text-info-foreground">
              <h3 className="text-xl font-semibold text-info-foreground mb-2 flex items-center justify-center">
                <UtensilsCrossed className="size-5 mr-2" /> Resumo da Dieta
              </h3>
              <p className="text-lg flex items-center justify-center">Calorias Diárias: <span className="font-bold text-primary ml-2">{totalCalories} kcal</span></p>
              <p className="text-lg flex items-center justify-center">
                <Droplet className="size-5 mr-2 text-blue-500" /> Ingestão de Água: <span className="font-bold text-primary ml-2">{waterIntake} litros/dia</span>
              </p>
            </div>

            <Separator className="my-6 bg-border" />

            <h3 className="text-2xl font-bold text-center text-primary mb-4">Seu Plano de Refeições</h3>
            <div className="space-y-8">
              {dietPlan.map((meal, index) => (
                <div key={index} className="bg-secondary p-4 rounded-lg shadow-sm border border-border">
                  <h4 className="text-xl font-semibold text-foreground mb-2">{meal.name} ({meal.time})</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Total da Refeição: <span className="font-bold">{meal.totalMealCalories} kcal</span> | P: <span className="font-bold">{meal.totalMealProtein}g</span> | C: <span className="font-bold">{meal.totalMealCarbs}g</span> | G: <span className="font-bold">{meal.totalMealFat}g</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {meal.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
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

            <Separator className="my-6 bg-border" />

            <div className="text-center text-muted-foreground text-sm">
              <p>Lembre-se: Este é um plano sugerido. Consulte um profissional de saúde para um acompanhamento personalizado.</p>
            </div>
          </div>

          <Button onClick={handleDownloadPdf} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 text-lg font-semibold flex items-center justify-center">
            <Download className="size-5 mr-2" /> Baixar Dieta em PDF
          </Button>
          {userEmail && (
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-md py-2 text-lg font-semibold flex items-center justify-center"
            >
              <Mail className="size-5 mr-2" /> {sendingEmail ? "Enviando..." : `Enviar Dieta por E-mail para ${userEmail}`}
            </Button>
          )}
          <Button onClick={() => navigate("/")} variant="outline" className="w-full rounded-md py-2 text-lg font-semibold border-border">
            Voltar ao Início
          </Button>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default DietPlanPage;