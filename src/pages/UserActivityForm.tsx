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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";
import React from "react";
import { AllFormData } from "@/utils/dietCalculations"; // Importar o tipo

const formSchema = z.object({
  practicesPhysicalActivity: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione se você pratica atividade física.",
  }),
  activityType: z.string().optional(),
  doesCardio: z.enum(["yes", "no"]).optional(),
  cardioFrequency: z.coerce.number().min(0, "Mínimo 0").max(7, "Máximo 7").optional(),
  trainingTime: z.enum(["morning", "afternoon", "night", "any"]).optional(), // Tornar opcional por padrão
  trainingLevel: z.enum(["sedentary", "light", "moderate", "intense", "very_intense"]).optional(), // Tornar opcional por padrão
}).superRefine((data, ctx) => {
  if (data.practicesPhysicalActivity === "yes") {
    if (!data.trainingTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor, selecione seu horário de treino preferido.",
        path: ["trainingTime"],
      });
    }
    if (!data.trainingLevel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor, selecione seu nível de treino.",
        path: ["trainingLevel"],
      });
    }
    if (data.doesCardio === "yes" && (data.cardioFrequency === undefined || data.cardioFrequency === null)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Por favor, insira a frequência do cardio.",
            path: ["cardioFrequency"],
        });
    }
  }
});

const UserActivityForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      practicesPhysicalActivity: undefined,
      activityType: "",
      doesCardio: undefined,
      cardioFrequency: undefined,
      trainingTime: undefined,
      trainingLevel: undefined,
    },
  });

  const practicesPhysicalActivity = form.watch("practicesPhysicalActivity");
  const doesCardio = form.watch("doesCardio");

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Informações de Atividade Física Coletadas! 🏃‍♀️",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
    console.log("Atividade física do usuário:", values);

    // Salvar dados no localStorage
    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, activity: values }));

    navigate("/goals"); // Navega para a próxima tela
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Seu Estilo de Vida Ativo 🏋️</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Conte-nos sobre suas atividades físicas para uma dieta ainda mais precisa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="practicesPhysicalActivity"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Você pratica alguma atividade física? (Academia, Crossfit, Esporte, etc.)</FormLabel>
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
                          <FormLabel className="font-normal">Sim 👍</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">Não 👎</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {practicesPhysicalActivity === "yes" && (
                <>
                  <FormField
                    control={form.control}
                    name="activityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qual(is) tipo(s) de atividade? (Ex: Musculação, Futebol, Yoga)</FormLabel>
                        <FormControl>
                          <Input placeholder="Separe por vírgulas" {...field} className="bg-input text-foreground" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="doesCardio"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Você faz cardio? (Corrida, Natação, Bicicleta)</FormLabel>
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
                              <FormLabel className="font-normal">Sim ❤️</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">Não 🚫</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {doesCardio === "yes" && (
                    <FormField
                      control={form.control}
                      name="cardioFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantas vezes por semana você faz cardio? 🗓️</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Ex: 3" {...field} className="bg-input text-foreground" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="trainingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qual seu horário de treino preferido? ⏰</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-input text-foreground">
                              <SelectValue placeholder="Selecione um horário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover text-popover-foreground">
                            <SelectItem value="morning">Manhã ☀️</SelectItem>
                            <SelectItem value="afternoon">Tarde 🌤️</SelectItem>
                            <SelectItem value="night">Noite 🌙</SelectItem>
                            <SelectItem value="any">Qualquer horário 🔄</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trainingLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qual seu nível de treino? (Considerando a frequência semanal) 📊</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-input text-foreground">
                              <SelectValue placeholder="Selecione seu nível" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover text-popover-foreground">
                            <SelectItem value="sedentary">Sedentário (quase nenhuma atividade) 🛋️</SelectItem>
                            <SelectItem value="light">Leve (1-2 vezes por semana) 🚶</SelectItem>
                            <SelectItem value="moderate">Moderado (3-4 vezes por semana) 🏃</SelectItem>
                            <SelectItem value="intense">Intenso (5-6 vezes por semana) 🏋️</SelectItem>
                            <SelectItem value="very_intense">Muito Intenso (todos os dias ou mais de uma vez ao dia) 🔥</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full">
                  Voltar ⬅️
                </Button>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
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

export default UserActivityForm;