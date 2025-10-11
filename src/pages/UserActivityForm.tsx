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
import { AllFormData } from "@/utils/dietCalculations";
import { Dumbbell, Heart, Clock, Gauge, Check, X } from "lucide-react"; // Importar ícones
import { Label } from "@/components/ui/label"; // Importar Label

const formSchema = z.object({
  practicesPhysicalActivity: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione se você pratica atividade física.",
  }),
  activityType: z.string().optional(),
  doesCardio: z.enum(["yes", "no"]).optional(),
  cardioFrequency: z.coerce.number().min(0, "Mínimo 0").max(7, "Máximo 7").optional(),
  trainingTime: z.enum(["morning", "afternoon", "night", "any"]).optional(),
  trainingLevel: z.enum(["sedentary", "light", "moderate", "intense", "very_intense"]).optional(),
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

    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, activity: values }));

    navigate("/goals");
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-accent rounded-t-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Dumbbell className="size-8 text-primary mr-2" />
            <CardTitle className="text-2xl font-bold text-primary">Atividade Física</CardTitle>
          </div>
          <CardDescription className="text-center text-muted-foreground">
            Conte sobre sua rotina de exercícios
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="practicesPhysicalActivity"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Você pratica alguma atividade física?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center">
                          <FormControl>
                            <RadioGroupItem value="yes" id="activity-yes" className="sr-only" />
                          </FormControl>
                          <Label
                            htmlFor="activity-yes"
                            className="flex items-center font-normal text-foreground cursor-pointer"
                          >
                            <Check className="size-4 mr-2 text-primary" /> Sim
                          </Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center">
                          <FormControl>
                            <RadioGroupItem value="no" id="activity-no" className="sr-only" />
                          </FormControl>
                          <Label
                            htmlFor="activity-no"
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

              {practicesPhysicalActivity === "yes" && (
                <>
                  <FormField
                    control={form.control}
                    name="activityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qual(is) tipo(s) de atividade?</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Musculação, Futebol, Yoga" {...field} className="bg-input text-foreground border-border" />
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
                        <FormLabel>Você faz cardio?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center">
                              <FormControl>
                                <RadioGroupItem value="yes" id="cardio-yes" className="sr-only" />
                              </FormControl>
                              <Label
                                htmlFor="cardio-yes"
                                className="flex items-center font-normal text-foreground cursor-pointer"
                              >
                                <Heart className="size-4 mr-2 text-primary" /> Sim
                              </Label>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center">
                              <FormControl>
                                <RadioGroupItem value="no" id="cardio-no" className="sr-only" />
                              </FormControl>
                              <Label
                                htmlFor="cardio-no"
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
                  {doesCardio === "yes" && (
                    <FormField
                      control={form.control}
                      name="cardioFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantas vezes por semana você faz cardio?</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Ex: 3" {...field} className="bg-input text-foreground border-border" />
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
                        <FormLabel className="flex items-center">
                          <Clock className="size-4 mr-2 text-primary" /> Qual seu horário de treino preferido?
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-input text-foreground border-border">
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
                        <FormLabel className="flex items-center">
                          <Gauge className="size-4 mr-2 text-primary" /> Qual seu nível de treino?
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-input text-foreground border-border">
                              <SelectValue placeholder="Selecione seu nível" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover text-popover-foreground">
                            <SelectItem value="sedentary">Sedentário (quase nenhuma atividade)</SelectItem>
                            <SelectItem value="light">Leve (1-2 vezes por semana)</SelectItem>
                            <SelectItem value="moderate">Moderado (3-4 vezes por semana)</SelectItem>
                            <SelectItem value="intense">Intenso (5-6 vezes por semana)</SelectItem>
                            <SelectItem value="very_intense">Muito Intenso (todos os dias ou mais de uma vez ao dia)</SelectItem>
                          </SelectContent>
                        </Select>
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

export default UserActivityForm;