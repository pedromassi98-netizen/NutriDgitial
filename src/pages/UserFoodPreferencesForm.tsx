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
import { toast } from "@/components/ui/use-toast";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";

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
    toast({
      title: "Preferências Alimentares Coletadas!",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
    console.log("Preferências do usuário:", values);
    // Em uma aplicação real, você enviaria todos os dados coletados
    // para um backend ou para uma função que calcula a dieta.
    // Por enquanto, vamos apenas mostrar o toast e voltar para o início.
    navigate("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Preferências Alimentares</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Conte-nos sobre seus gostos e restrições.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="preferredCarbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carboidratos Preferidos (ex: arroz, batata, pão integral)</FormLabel>
                    <FormControl>
                      <Input placeholder="Separe por vírgulas" {...field} className="bg-input text-foreground" />
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
                    <FormLabel>Proteínas Preferidas (ex: frango, ovos, feijão, tofu)</FormLabel>
                    <FormControl>
                      <Input placeholder="Separe por vírgulas" {...field} className="bg-input text-foreground" />
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
                    <FormLabel>Vegetais Preferidos (ex: brócolis, espinafre, cenoura)</FormLabel>
                    <FormControl>
                      <Input placeholder="Separe por vírgulas" {...field} className="bg-input text-foreground" />
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
                    <FormLabel>Frutas Preferidas (ex: maçã, banana, morango)</FormLabel>
                    <FormControl>
                      <Input placeholder="Separe por vírgulas" {...field} className="bg-input text-foreground" />
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
                    <FormLabel>Restrições Alimentares / Alergias (ex: sem glúten, sem lactose, alergia a amendoim)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva suas restrições ou alergias"
                        className="resize-none bg-input text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Finalizar e Gerar Dieta
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default UserFoodPreferencesForm;