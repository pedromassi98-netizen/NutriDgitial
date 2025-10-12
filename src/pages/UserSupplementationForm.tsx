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
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";
import React from "react";
import { AllFormData } from "@/utils/dietCalculations";
import { Pill, Check, X, Milk, Zap, Heart, TrendingUp, TrendingDown, Apple, ShieldCheck, Scissors, Fish, Coffee } from "lucide-react"; // Importar ícones
import { Label } from "@/components/ui/label"; // Importar Label

const formSchema = z.object({
  usesSupplements: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione se você usa suplementos.",
  }),
  currentSupplements: z.array(z.string()).optional(),
  wantsToToUseSupplements: z.enum(["yes", "no"]).optional(),
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
  if (data.wantsToToUseSupplements === "yes" && (!data.supplementationGoals || data.supplementationGoals.length === 0) && !data.otherSupplementationGoals) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Por favor, selecione seus objetivos com a suplementação ou descreva outros.",
      path: ["supplementationGoals"],
    });
  }
});

const commonSupplements = [
  { id: "whey_protein", label: "Whey Protein", icon: <Milk className="size-4 mr-2 text-primary" /> },
  { id: "creatine", label: "Creatina", icon: <Zap className="size-4 mr-2 text-primary" /> },
  { id: "caffeine", label: "Cafeína", icon: <Coffee className="size-4 mr-2 text-primary" /> },
  { id: "multivitamin", label: "Multivitamínico", icon: <Pill className="size-4 mr-2 text-primary" /> },
  { id: "bcaa", label: "BCAA", icon: <Heart className="size-4 mr-2 text-primary" /> },
  { id: "omega_3", label: "Ômega 3", icon: <Fish className="size-4 mr-2 text-primary" /> },
  { id: "pre_workout", label: "Pré-treino", icon: <Zap className="size-4 mr-2 text-primary" /> },
];

const supplementationGoalsOptions = [
  { id: "muscle_gain", label: "Ganho de Massa Muscular", icon: <TrendingUp className="size-4 mr-2 text-primary" /> },
  { id: "weight_loss", label: "Emagrecimento", icon: <TrendingDown className="size-4 mr-2 text-primary" /> },
  { id: "energy", label: "Mais Energia e Disposição", icon: <Zap className="size-4 mr-2 text-primary" /> },
  { id: "recovery", label: "Melhora na Recuperação Pós-treino", icon: <ShieldCheck className="size-4 mr-2 text-primary" /> },
  { id: "health", label: "Saúde Geral e Bem-estar", icon: <Apple className="size-4 mr-2 text-primary" /> },
];

const UserSupplementationForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usesSupplements: undefined,
      currentSupplements: [],
      wantsToToUseSupplements: undefined,
      supplementationGoals: [],
      otherSupplementationGoals: "",
    },
  });

  const usesSupplements = form.watch("usesSupplements");
  const wantsToToUseSupplements = form.watch("wantsToToUseSupplements");

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

    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, supplementation: values }));

    navigate("/food-preferences");
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-accent rounded-t-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Pill className="size-8 text-primary mr-2" />
            <CardTitle className="text-2xl font-bold text-primary">Sua Suplementação</CardTitle>
          </div>
          <CardDescription className="text-center text-muted-foreground">
            Conte-nos sobre seu uso de suplementos para uma dieta ainda mais completa.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center">
                          <FormControl>
                            <RadioGroupItem value="yes" id="supplements-yes" className="sr-only" />
                          </FormControl>
                          <Label
                            htmlFor="supplements-yes"
                            className="flex items-center font-normal text-foreground cursor-pointer"
                          >
                            <Check className="size-4 mr-2 text-primary" /> Sim
                          </Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center">
                          <FormControl>
                            <RadioGroupItem value="no" id="supplements-no" className="sr-only" />
                          </FormControl>
                          <Label
                            htmlFor="supplements-no"
                            className="flex items-center font-normal text-foreground cursor-pointer"
                          >
                            <X className="size-4 mr-2 text-destructive" /> Não
                          </Label>
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
                                className="flex flex-row items-start space-x-3 space-y-0 bg-secondary p-3 rounded-md"
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
                                    className="mt-1"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center">
                                  {item.icon} {item.label}
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
                name="wantsToToUseSupplements"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Você deseja começar a usar alguma suplementação?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center">
                          <FormControl>
                            <RadioGroupItem value="yes" id="wants-supplements-yes" className="sr-only" />
                          </FormControl>
                          <Label
                            htmlFor="wants-supplements-yes"
                            className="flex items-center font-normal text-foreground cursor-pointer"
                          >
                            <Check className="size-4 mr-2 text-primary" /> Sim
                          </Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center">
                          <FormControl>
                            <RadioGroupItem value="no" id="wants-supplements-no" className="sr-only" />
                          </FormControl>
                          <Label
                            htmlFor="wants-supplements-no"
                            className="flex items-center font-normal text-foreground cursor-pointer"
                          >
                            <X className="size-4 mr-2 text-destructive" /> Não
                          </Label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {wantsToToUseSupplements === "yes" && (
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
                                  className="flex flex-row items-start space-x-3 space-y-0 bg-secondary p-3 rounded-md"
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
                                      className="mt-1"
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal flex items-center">
                                    {item.icon} {item.label}
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
                            className="resize-none bg-input text-foreground border-border"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

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
      <MadeWithDyad />
    </div>
  );
};

export default UserSupplementationForm;