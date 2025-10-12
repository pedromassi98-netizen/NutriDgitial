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
import { toast } from "@/components/ui/use-toast";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";
import { AllFormData } from "@/utils/dietCalculations";
import { Sun, Coffee, Utensils, Apple, Moon, Clock, Lightbulb, CheckCircle2 } from "lucide-react"; // Importar ícones

const formSchema = z.object({
  wakeUpTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
  breakfastTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
  lunchTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
  snackTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM).").optional().or(z.literal('')),
  dinnerTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
  sleepTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
});

const DailyRoutineForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wakeUpTime: "",
      breakfastTime: "",
      lunchTime: "",
      snackTime: "",
      dinnerTime: "",
      sleepTime: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Rotina Diária Coletada! ⏰",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
    console.log("Rotina diária do usuário:", values);

    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, routine: values }));

    navigate("/supplementation");
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-primary-subtle rounded-t-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="size-8 text-primary mr-2" />
            <CardTitle className="text-2xl font-bold text-primary">Sua Rotina Diária</CardTitle>
          </div>
          <CardDescription className="text-center text-muted-foreground">
            Horários das suas refeições para MÁXIMOS resultados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="wakeUpTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Sun className="size-4 mr-2 text-primary" /> Acordar
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="breakfastTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Coffee className="size-4 mr-2 text-primary" /> Café da manhã
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lunchTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Utensils className="size-4 mr-2 text-primary" /> Almoço
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="snackTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Apple className="size-4 mr-2 text-primary" /> Lanche (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dinnerTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Utensils className="size-4 mr-2 text-primary" /> Jantar
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sleepTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Moon className="size-4 mr-2 text-primary" /> Dormir
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="bg-info p-4 rounded-md space-y-2 text-info-foreground">
                <h3 className="font-bold text-lg flex items-center">
                  <Lightbulb className="size-5 mr-2" /> DICA DE OURO
                </h3>
                <ul className="list-none space-y-1 text-sm">
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-primary" /> Horários regulares aceleram o metabolismo em até 23%</li>
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-primary" /> Melhora a queima de gordura e absorção de nutrientes</li>
                  <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-primary" /> Resultados 3x mais rápidos com disciplina nos horários</li>
                </ul>
              </div>
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

export default DailyRoutineForm;