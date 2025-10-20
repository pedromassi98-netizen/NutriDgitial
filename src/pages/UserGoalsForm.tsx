"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { AllFormData } from "@/utils/dietCalculations";
import { Target, TrendingDown, TrendingUp, Scale, Apple } from "lucide-react"; // Ícones atualizados
import { Label } from "@/components/ui/label"; // Importar Label

const formSchema = z.object({
  goal: z.enum(["weight_loss", "muscle_gain", "maintenance", "healthy_eating"], {
    required_error: "Por favor, selecione um objetivo.",
  }),
});

const UserGoalsForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: undefined,
    },
  });

  const selectedGoal = form.watch("goal"); // Observar o valor selecionado

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Objetivo do usuário:", values);

    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, goals: values }));

    navigate("/daily-routine");
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-primary-subtle rounded-t-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="size-8 text-primary mr-2" />
            <CardTitle className="text-3xl font-extrabold text-primary">Seu Objetivo Principal</CardTitle>
          </div>
          <CardDescription className="text-center text-muted-foreground">
            Qual é o seu principal objetivo com a dieta?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Selecione uma opção</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem
                          className={`flex items-center space-x-3 space-y-0 bg-secondary p-3 rounded-md cursor-pointer transition-all duration-200 ${
                            selectedGoal === "weight_loss" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                          }`}
                        >
                          <FormControl>
                            <RadioGroupItem value="weight_loss" id="goal-weight-loss" className="sr-only" />
                          </FormControl>
                          <Label htmlFor="goal-weight-loss" className="flex items-center font-normal text-lg cursor-pointer w-full">
                            <TrendingDown className="size-4 mr-2 text-primary" /> Emagrecimento
                          </Label>
                        </FormItem>
                        <FormItem
                          className={`flex items-center space-x-3 space-y-0 bg-secondary p-3 rounded-md cursor-pointer transition-all duration-200 ${
                            selectedGoal === "muscle_gain" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                          }`}
                        >
                          <FormControl>
                            <RadioGroupItem value="muscle_gain" id="goal-muscle-gain" className="sr-only" />
                          </FormControl>
                          <Label htmlFor="goal-muscle-gain" className="flex items-center font-normal text-lg cursor-pointer w-full">
                            <TrendingUp className="size-4 mr-2 text-primary" /> Ganho de Massa Muscular
                          </Label>
                        </FormItem>
                        <FormItem
                          className={`flex items-center space-x-3 space-y-0 bg-secondary p-3 rounded-md cursor-pointer transition-all duration-200 ${
                            selectedGoal === "maintenance" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                          }`}
                        >
                          <FormControl>
                            <RadioGroupItem value="maintenance" id="goal-maintenance" className="sr-only" />
                          </FormControl>
                          <Label htmlFor="goal-maintenance" className="flex items-center font-normal text-lg cursor-pointer w-full">
                            <Scale className="size-4 mr-2 text-primary" /> Manutenção de Peso
                          </Label>
                        </FormItem>
                        <FormItem
                          className={`flex items-center space-x-3 space-y-0 bg-secondary p-3 rounded-md cursor-pointer transition-all duration-200 ${
                            selectedGoal === "healthy_eating" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                          }`}
                        >
                          <FormControl>
                            <RadioGroupItem value="healthy_eating" id="goal-healthy-eating" className="sr-only" />
                          </FormControl>
                          <Label htmlFor="goal-healthy-eating" className="flex items-center font-normal text-lg cursor-pointer w-full">
                            <Apple className="size-4 mr-2 text-primary" /> Apenas ter uma alimentação saudável
                          </Label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full rounded-md py-2 text-lg font-semibold border-border">
                  Voltar ⬅️
                </Button>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 text-lg font-semibold">
                  Próximo ➡️
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserGoalsForm;