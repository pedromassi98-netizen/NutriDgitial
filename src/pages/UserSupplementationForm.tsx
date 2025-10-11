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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";
import React from "react";

const formSchema = z.object({
  usesSupplements: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione se você usa suplementos.",
  }),
  currentSupplements: z.array(z.string()).optional(),
  wantsToUseSupplements: z.enum(["yes", "no"]).optional(),
  supplementationGoals: z.array(z.string()).optional(),
  otherSupplementationGoals: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.usesSupplements === "yes" && (!data.currentSupplements || data.currentSupplements.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Por favor, selecione quais suplementos você usa.",
      path: ["currentSupplements"],
    });
  }
  if (data.wantsToUseSupplements === "yes" && (!data.supplementationGoals || data.supplementationGoals.length === 0) && !data.otherSupplementationGoals) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Por favor, selecione seus objetivos com a suplementação ou descreva outros.",
      path: ["supplementationGoals"],
    });
  }
});

const commonSupplements = [
  { id: "whey_protein", label: "Whey Protein 🥛" },
  { id: "creatine", label: "Creatina 💪" },
  { id: "caffeine", label: "Cafeína ☕" },
  { id: "multivitamin", label: "Multivitamínico 💊" },
  { id: "bcaa", label: "BCAA ✨" },
  { id: "omega_3", label: "Ômega 3 🐟" },
  { id: "pre_workout", label: "Pré-treino 🚀" },
];

const supplementationGoalsOptions = [
  { id: "muscle_gain", label: "Ganho de Massa Muscular 💪" },
  { id: "weight_loss", label: "Emagrecimento 📉" },
  { id: "energy", label: "Mais Energia e Disposição ⚡" },
  { id: "recovery", label: "Melhora na Recuperação Pós-treino 🩹" },
  { id: "health", label: "Saúde Geral e Bem-estar 🍎" },
];

const UserSupplementationForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usesSupplements: undefined,
      currentSupplements: [],
      wantsToUseSupplements: undefined,
      supplementationGoals: [],
      otherSupplementationGoals: "",
    },
  });

  const usesSupplements = form.watch("usesSupplements");
  const wantsToUseSupplements = form.watch("wantsToUseSupplements");

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Informações de Suplementação Coletadas! 💊",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
    console.log("Suplementação do usuário:", values);
    navigate("/food-preferences"); // Navega para a próxima tela
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Sua Suplementação 💊</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Conte-nos sobre seu uso de suplementos para uma dieta ainda mais completa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="usesSupplements"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Você já usa algum tipo de suplementação atualmente?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Sim ✅</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">Não ❌</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {usesSupplements === "yes" && (
                <FormField
                  control={form.control}
                  name="currentSupplements"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Quais suplementos você usa?</FormLabel>
                        <FormDescription>
                          Selecione todos que se aplicam.
                        </FormDescription>
                      </div>
                      {commonSupplements.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="currentSupplements"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="wantsToUseSupplements"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Você deseja começar a usar alguma suplementação?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Sim, quero explorar! 💡</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">Não, obrigado(a). 🙏</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {wantsToUseSupplements === "yes" && (
                <>
                  <FormField
                    control={form.control}
                    name="supplementationGoals"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Quais objetivos você quer alcançar com a suplementação?</FormLabel>
                          <FormDescription>
                            Selecione todos que se aplicam.
                          </FormDescription>
                        </div>
                        {supplementationGoalsOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="supplementationGoals"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otherSupplementationGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outros objetivos com a suplementação (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva outros objetivos que você tem em mente..."
                            className="resize-none bg-input text-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Próximo ➡️
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default UserSupplementationForm;