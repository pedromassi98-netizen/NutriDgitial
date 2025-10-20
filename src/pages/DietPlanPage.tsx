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
import {
  AllFormData,
  calculateWaterIntake,
  Meal,
} from "@/utils/dietCalculations";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas"; // Corrigido aqui
import { UtensilsCrossed, Droplet, Download, Mail, Beef, Carrot, Apple, CheckCircle2, Lightbulb, Leaf, Coffee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateDietPlan } from "@/utils/dietGenerator";
// Removido import { getSupplementRecommendations, RecommendedSupplement } from "@/utils/supplementationCalculations";
import { cn } from "@/lib/utils"; // Importar cn para classes condicionais

const DietPlanPage = () => {
  const navigate = useNavigate();
  const [dietPlan, setDietPlan] = useState<Meal[]>([]);
  const [totalCalories, setTotalCalories] = useState<number | null>(null);
  const [totalProtein, setTotalProtein] = useState<number | null>(null);
  const [totalCarbs, setTotalCarbs] = useState<number | null>(null);
  const [totalFat, setTotalFat] = useState<number | null>(null);
  const [waterIntake, setWaterIntake] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  // Removido [recommendedSupplements, setRecommendedSupplements] = useState<RecommendedSupplement[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const loadDietData = async () => {
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

        const generatedPlan = generateDietPlan(formData);

        if (!generatedPlan) {
          setError("Não foi possível gerar um plano de dieta adequado para o seu perfil. Por favor, revise suas informações.");
          setLoading(false);
          return;
        }

        setDietPlan(generatedPlan.meals);
        setTotalCalories(generatedPlan.totalCalories);
        setTotalProtein(generatedPlan.protein);
        setTotalCarbs(generatedPlan.carbs);
        setTotalFat(generatedPlan.fat);

        const requiredWater = (calculateWaterIntake(profile.weight, activity.trainingLevel) / 1000).toFixed(1);
        setWaterIntake(requiredWater);

        // Removido a chamada para getSupplementRecommendations
        // setRecommendedSupplements(supplements);

        setLoading(false);
      } catch (e: any) {
        console.error("Erro ao carregar dados da dieta:", e);
        setError("Ocorreu um erro ao gerar sua dieta. Tente novamente. Detalhes: " + e.message);
        setLoading(false);
      }
    };

    loadDietData();
  }, []);

  useEffect(() => {
    console.log("DietPlanPage - current dietPlan state:", dietPlan);
    console.log("DietPlanPage - current totalCalories state:", totalCalories);
    console.log("DietPlanPage - current totalProtein state:", totalProtein);
    console.log("DietPlanPage - current totalCarbs state:", totalCarbs);
    console.log("DietPlanPage - current totalFat state:", totalFat);
    console.log("DietPlanPage - current waterIntake state:", waterIntake);
    console.log("DietPlanPage - current loading state:", loading);
    console.log("DietPlanPage - current error state:", error);
    // Removido console.log para recommendedSupplements
  }, [dietPlan, totalCalories, totalProtein, totalCarbs, totalFat, waterIntake, loading, error]);

  const generatePdf = async () => {
    if (!cardRef.current) return null;

    const input = cardRef.current;
    
    const originalOverflow = document.body.style.overflow;
    const originalCardWidth = input.style.width;
    const originalCardMaxWidth = input.style.maxWidth;
    const originalCardPadding = input.style.padding;
    const originalCardMargin = input.style.margin;

    document.body.style.overflow = 'visible';
    input.style.width = '210mm';
    input.style.maxWidth = 'none';
    input.style.padding = '10mm';
    input.style.margin = '0';

    await new Promise(resolve => setTimeout(resolve, 100)); 

    const canvas = await html2canvas(input, { 
      scale: 3,
      useCORS: true,
    });

    document.body.style.overflow = originalOverflow;
    input.style.width = originalCardWidth;
    input.style.maxWidth = originalCardMaxWidth;
    input.style.padding = originalCardPadding;
    input.style.margin = originalCardMargin;

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  };

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;

    setIsGeneratingPdf(true);
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
      } else {
        toast({
          title: "Erro ao Gerar PDF ⚠️",
          description: "Não foi possível criar o arquivo PDF. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Erro ao baixar PDF:", err);
      toast({
        title: "Erro ao Baixar PDF ⚠️",
        description: "Ocorreu um erro inesperado ao tentar baixar a dieta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
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

    setIsSendingEmail(true);
    toast({
      title: "Enviando e-mail...",
      description: "Por favor, aguarde enquanto enviamos sua dieta.",
    });

    try {
      const pdf = await generatePdf();
      if (!pdf) {
        throw new Error("Não foi possível gerar o PDF para envio.");
      }
      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      console.log("PDF Base64 size:", pdfBase64.length / 1024 / 1024, "MB");

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
    } catch (err: any) {
      console.error("Erro ao enviar e-mail:", err);
      toast({
        title: "Erro ao Enviar E-mail ⚠️",
        description: `Não foi possível enviar a dieta para ${userEmail}. Erro: ${err.message || err}`,
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
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
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4 diet-page-background">
      <Card ref={cardRef} className="w-full max-w-2xl bg-card text-card-foreground shadow-xl rounded-xl border-none">
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
          {/* Seção de Resumo Diário */}
          <Card className="shadow-md rounded-xl border bg-white dark:bg-card border-black dark:border-gray-700 p-4">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 text-center">Resumo Diário</CardTitle>
            </CardHeader>
            <CardContent className="p-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-muted/30 rounded-lg p-3 text-center shadow-sm">
                <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Calorias</span>
                <span className="text-xl font-bold text-accent-green dark:text-accent-green">{totalCalories}</span>
                <span className="text-xs text-gray-500 dark:text-muted-foreground">kcal</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-muted/30 rounded-lg p-3 text-center shadow-sm">
                <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Proteína</span>
                <span className="text-xl font-bold text-accent-green dark:text-accent-green">{totalProtein}</span>
                <span className="text-xs text-gray-500 dark:text-muted-foreground">g</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-muted/30 rounded-lg p-3 text-center shadow-sm">
                <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Carboidratos</span>
                <span className="text-xl font-bold text-accent-green dark:text-accent-green">{totalCarbs}</span>
                <span className="text-xs text-gray-500 dark:text-muted-foreground">g</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-muted/30 rounded-lg p-3 text-center shadow-sm">
                <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Gorduras</span>
                <span className="text-xl font-bold text-accent-green dark:text-accent-green">{totalFat}</span>
                <span className="text-xs text-gray-500 dark:text-muted-foreground">g</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-muted/30 rounded-lg p-3 text-center shadow-sm">
                <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Água</span>
                <span className="text-xl font-bold text-accent-blue dark:text-accent-blue">{waterIntake}</span>
                <span className="text-xs text-gray-500 dark:text-muted-foreground">litros</span>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6 bg-border" />

          <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-foreground mb-4">Seu Plano de Refeições</h3>
          <div className="space-y-4">
            {dietPlan.map((meal, index) => (
              <Card key={index} className="shadow-sm rounded-xl border bg-white dark:bg-card border-black dark:border-gray-700">
                <CardHeader className="bg-primary-subtle dark:bg-muted/50 p-4 rounded-t-xl flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-foreground flex items-center">
                    <UtensilsCrossed className="size-5 mr-2 text-primary" /> {meal.name} <span className="text-base font-normal text-gray-600 dark:text-muted-foreground ml-2">({meal.time})</span>
                  </CardTitle>
                  <span className="text-lg font-bold text-primary dark:text-primary">{meal.totalMealCalories} kcal</span>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Coluna de Alimentos */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-foreground mb-2">Alimentos:</h4>
                    <ul className="list-none space-y-1">
                      {meal.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start text-gray-700 dark:text-muted-foreground text-base">
                          <CheckCircle2 className="size-4 mr-2 mt-1 text-accent-green dark:text-accent-green shrink-0" />
                          <div>
                            <span className="font-medium text-foreground dark:text-foreground">{item.food}:</span> {item.quantity}
                            {item.substitutions && item.substitutions.length > 0 && (
                              <span className="block text-sm text-gray-500 dark:text-muted-foreground mt-0.5">
                                (Ou: {item.substitutions.join(", ")})
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Coluna de Macros da Refeição */}
                  <div className="bg-gray-100 dark:bg-muted/30 rounded-lg p-4 shadow-sm space-y-2">
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-foreground text-center mb-2">Macros desta Refeição:</h4>
                    <div className="flex justify-between items-center text-base font-medium text-gray-700 dark:text-muted-foreground">
                      <span className="flex items-center"><Beef className="size-4 mr-2 text-red-500" /> Proteína:</span>
                      <span className="font-bold text-foreground dark:text-foreground">{meal.totalMealProtein}g</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-medium text-gray-700 dark:text-muted-foreground">
                      <span className="flex items-center"><Carrot className="size-4 mr-2 text-orange-500" /> Carboidratos:</span>
                      <span className="font-bold text-foreground dark:text-foreground">{meal.totalMealCarbs}g</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-medium text-gray-700 dark:text-muted-foreground">
                      <span className="flex items-center"><Apple className="size-4 mr-2 text-yellow-500" /> Gorduras:</span>
                      <span className="font-bold text-foreground dark:text-foreground">{meal.totalMealFat}g</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Seção de Suplementação Recomendada removida */}

          {/* Nova Seção de Dicas */}
          <Separator className="my-6 bg-border" />
          <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-foreground mb-4 flex items-center justify-center">
            <Lightbulb className="size-6 mr-2 text-primary" /> Dicas Essenciais
          </h3>
          <div className="space-y-4">
            <Card className="shadow-sm rounded-xl border bg-white dark:bg-card border-black dark:border-gray-700">
              <CardHeader className="bg-primary-subtle dark:bg-muted/50 p-4 rounded-t-xl">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-foreground flex items-center">
                  <Leaf className="size-5 mr-2 text-accent-green" /> Dicas para Alimentação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-gray-700 dark:text-muted-foreground">
                <ul className="list-none space-y-1">
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-accent-green" /> Vegetais à vontade! Eles quase não interferem nas calorias, mas são ricos em fibras, vitaminas e minerais. Portanto, não se esqueça de consumi-los.</li>
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-accent-green" /> Prefira temperos naturais. Evite os ultraprocessados.</li>
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-accent-green" /> Monte pratos coloridos. Quanto mais cores, mais variedade de nutrientes você consome.</li>
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-accent-green" /> Evite pular refeições. Isso pode aumentar a fome e dificultar o controle da alimentação.</li>
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-accent-green" /> Coma devagar. Mastigar bem melhora a digestão e ajuda o cérebro a perceber a saciedade.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm rounded-xl border bg-white dark:bg-card border-black dark:border-gray-700">
              <CardHeader className="bg-primary-subtle dark:bg-muted/50 p-4 rounded-t-xl">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-foreground flex items-center">
                  <Droplet className="size-5 mr-2 text-accent-blue" /> Dicas de Hidratação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-gray-700 dark:text-muted-foreground">
                <ul className="list-none space-y-1">
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-accent-green" /> Beba água ao longo do dia. Às vezes, a sede pode ser confundida com fome.</li>
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-accent-green" /> Mesmo os sucos NATURAIS, ainda contêm açúcar, o que pode atrapalhar seu processo de emagrecimento.</li>
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-accent-green" /> Chás, Bebidas Zero e café podem ser ingeridos à gosto.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          {/* Fim da Nova Seção de Dicas */}

          <Separator className="my-6 bg-border" />

          <div className="text-center text-muted-foreground text-sm space-y-2">
            <p>Lembre-se: Este é um plano sugerido. Consulte um profissional de saúde para um acompanhamento personalizado.</p>
            <p>Recomendamos revisar sua dieta a cada 2 a 3 meses para garantir que continue trazendo resultados.</p>
          </div>
        </CardContent>
        <div className="p-6 space-y-4">
          <Button 
            onClick={handleDownloadPdf} 
            disabled={isGeneratingPdf || isSendingEmail}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-3 text-lg font-semibold flex items-center justify-center"
          >
            <Download className="size-5 mr-2" /> {isGeneratingPdf ? "Gerando PDF..." : "Baixar Dieta em PDF"}
          </Button>
          {userEmail && (
            <Button
              onClick={handleSendEmail}
              disabled={isGeneratingPdf || isSendingEmail}
              className="w-full bg-green-600 text-white hover:bg-green-700 rounded-md py-3 text-lg font-semibold flex items-center justify-center"
            >
              <Mail className="size-5 mr-2" /> {isSendingEmail ? "Enviando..." : `Enviar Dieta por E-mail para ${userEmail}`}
            </Button>
          )}
          <Button onClick={() => navigate("/")} variant="outline" className="w-full rounded-md py-3 text-lg font-semibold border-border text-gray-700 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted/30">
            Voltar ao Início
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DietPlanPage;