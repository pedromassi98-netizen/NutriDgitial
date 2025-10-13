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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";
import { AllFormData } from "@/utils/dietCalculations";
import { Carrot, Drumstick, Leaf, Cherry, Ban, Utensils } from "lucide-react"; // Importar ícones

const formSchema = z.object({
  preferredCarbs: z.string().optional(),
  preferredProteins: z.string().optional(),
  preferredVegetables: z.string().optional(),
  preferredFruits: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
});

const UserFoodPreferencesForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredCarbs: "",
      preferredProteins: "",
      preferredVegetables: "",
      preferredFruits: "",
      dietaryRestrictions: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Removido o toast de sucesso
    console.log("Preferências do usuário:", values);

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
            Conte-nos sobre seus gostos e restrições para uma dieta perfeita para você.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="preferredCarbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Carrot className="size-4 mr-2 text-primary" /> Carboidratos Preferidos
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: arroz, batata, pão integral" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredProteins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Drumstick className="size-4 mr-2 text-primary" /> Proteínas Preferidas
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: frango, ovos, feijão, tofu" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredVegetables"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Leaf className="size-4 mr-2 text-primary" /> Vegetais Preferidos
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: brócolis, espinafre, cenoura" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredFruits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Cherry className="size-4 mr-2 text-primary" /> Frutas Preferidas
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: maçã, banana, morango" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dietaryRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Ban className="size-4 mr-2 text-destructive" /> Restrições Alimentares / Alergias
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva suas restrições ou alergias"
                        className="resize-none bg-input text-foreground border-border"
                        {...field}
                      />
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