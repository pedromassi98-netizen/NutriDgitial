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

const formSchema = z.object({
  wakeUpTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
  breakfastTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
  lunchTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM)."),
  snackTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Por favor, insira um horário válido (HH:MM).").optional().or(z.literal('')),
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
    navigate("/food-preferences"); // Navega para a próxima tela
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Sua Rotina Diária 🗓️</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Para uma dieta perfeita, precisamos entender seu dia a dia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="wakeUpTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Que horas você acorda? ☀️</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground" />
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
                    <FormLabel>Que horas você toma café da manhã? ☕</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground" />
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
                    <FormLabel>Que horas você almoça? 🍽️</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground" />
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
                    <FormLabel>Que horas você faz um lanche? (Opcional) 🍎</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground" />
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
                    <FormLabel>Que horas você costuma dormir? 😴</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-input text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default DailyRoutineForm;