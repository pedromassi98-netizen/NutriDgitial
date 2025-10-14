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
import { Textarea } from "@/components/ui/textarea";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";
import { AllFormData } from "@/utils/dietCalculations";
import { Utensils, Coffee, Apple, Soup } from "lucide-react"; // Importar ícones relevantes

const formSchema = z.object({
  preferredBreakfastFoods: z.string().optional(),
  preferredLunchFoods: z.string().optional(),
  preferredSnackFoods: z.string().optional(),
  preferredDinnerFoods: z.string().optional(),
});

const UserFoodPreferencesForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredBreakfastFoods: "",
      preferredLunchFoods: "",
      preferredSnackFoods: "",
      preferredDinnerFoods: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Preferências de alimentos por refeição do usuário:", values);

    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, foodPreferences: values }));

    navigate("/diet-plan");
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-primary-subtle rounded-t-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Utensils className="size-8 text-primary mr-2" />
            <CardTitle className="text-3xl font-extrabold text-primary">Preferências Alimentares</CardTitle>
          </div>
          <CardDescription className="text-center text-muted-foreground">
            Liste os alimentos que você gostaria de incluir em cada refeição.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="preferredBreakfastFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Coffee className="size-4 mr-2 text-primary" /> Café da Manhã
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: ovos, aveia, frutas, pão integral" {...field} className="resize-none bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredLunchFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Soup className="size-4 mr-2 text-primary" /> Almoço
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: frango, arroz integral, brócolis, salada" {...field} className="resize-none bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredSnackFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Apple className="size-4 mr-2 text-primary" /> Lanche (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: iogurte grego, castanhas, banana" {...field} className="resize-none bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredDinnerFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Utensils className="size-4 mr-2 text-primary" /> Jantar
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: salmão, batata doce, espinafre" {...field} className="resize-none bg-input text-foreground border-border" />
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
                  Finalizar e Gerar Dieta 🎉
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default UserFoodPreferencesForm;