"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, // Importar FormDescription
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AllFormData } from "@/utils/dietCalculations";

const formSchema = z.object({
  practicesPhysicalActivity: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione se você pratica atividade física.",
  }),
  trainingLevel: z.enum(["sedentary", "light", "moderate", "intense", "very_intense"]).optional(),
});

const UserActivityForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      practicesPhysicalActivity: undefined,
      trainingLevel: undefined,
    },
  });

  const practicesPhysicalActivity = form.watch("practicesPhysicalActivity");

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Dados de atividade física do usuário:", values);

    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, activity: values }));

    navigate("/goals"); // Navega para a tela de objetivos
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-primary-subtle rounded-t-xl p-6 text-center">
          <CardTitle className="text-3xl font-extrabold text-primary mb-2">
            Sua Atividade Física 🏃‍♀️
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Conte-nos sobre seus hábitos de atividade física para uma dieta mais precisa.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="practicesPhysicalActivity"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">Você pratica alguma atividade física?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                      >
                        <FormItem
                          className={`flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center cursor-pointer transition-all duration-200 ${
                            field.value === "yes" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                          }`}
                        >
                          <FormControl>
                            <RadioGroupItem value="yes" id="activity-yes" className="sr-only" />
                          </FormControl>
                          <FormLabel htmlFor="activity-yes" className="font-normal text-lg cursor-pointer">
                            Sim
                          </FormLabel>
                        </FormItem>
                        <FormItem
                          className={`flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center cursor-pointer transition-all duration-200 ${
                            field.value === "no" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                          }`}
                        >
                          <FormControl>
                            <RadioGroupItem value="no" id="activity-no" className="sr-only" />
                          </FormControl>
                          <FormLabel htmlFor="activity-no" className="font-normal text-lg cursor-pointer">
                            Não
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {practicesPhysicalActivity === "yes" && (
                <FormField
                  control={form.control}
                  name="trainingLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg font-semibold">Qual o seu nível de atividade?</FormLabel>
                      <FormDescription className="text-sm text-muted-foreground mt-1">
                        Selecione seu nível de treino com atenção — essa informação é essencial para ajustar suas calorias e macros corretamente.
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem
                            className={`flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md cursor-pointer transition-all duration-200 ${
                              field.value === "sedentary" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                            }`}
                          >
                            <FormControl>
                              <RadioGroupItem value="sedentary" id="level-sedentary" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="level-sedentary" className="font-normal cursor-pointer">
                              Sedentário (pouco ou nenhum exercício)
                            </FormLabel>
                          </FormItem>
                          <FormItem
                            className={`flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md cursor-pointer transition-all duration-200 ${
                              field.value === "light" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                            }`}
                          >
                            <FormControl>
                              <RadioGroupItem value="light" id="level-light" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="level-light" className="font-normal cursor-pointer">
                              Levemente Ativo (exercício leve 1-3 dias/semana)
                            </FormLabel>
                          </FormItem>
                          <FormItem
                            className={`flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md cursor-pointer transition-all duration-200 ${
                              field.value === "moderate" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                            }`}
                          >
                            <FormControl>
                              <RadioGroupItem value="moderate" id="level-moderate" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="level-moderate" className="font-normal cursor-pointer">
                              Moderadamente Ativo (exercício moderado 3-5 dias/semana)
                            </FormLabel>
                          </FormItem>
                          <FormItem
                            className={`flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md cursor-pointer transition-all duration-200 ${
                              field.value === "intense" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                            }`}
                          >
                            <FormControl>
                              <RadioGroupItem value="intense" id="level-intense" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="level-intense" className="font-normal cursor-pointer">
                              Muito Ativo (exercício intenso 6-7 dias/semana)
                            </FormLabel>
                          </FormItem>
                          <FormItem
                            className={`flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md cursor-pointer transition-all duration-200 ${
                              field.value === "very_intense" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                            }`}
                          >
                            <FormControl>
                              <RadioGroupItem value="very_intense" id="level-very-intense" className="sr-only" />
                            </FormControl>
                            <FormLabel htmlFor="level-very-intense" className="font-normal cursor-pointer">
                              Extremamente Ativo (exercício muito intenso, 2x ao dia)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full rounded-md py-2 text-lg font-semibold border-border">
                  Voltar ⬅️
                </Button>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 text-lg font-semibold">
                  Continuar
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