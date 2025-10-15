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
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";
import { AllFormData } from "@/utils/dietCalculations";
import { User, Mail, Users } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().email("Por favor, insira um e-mail válido."),
});

const WelcomeForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Dados do formulário de boas-vindas:", values);

    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, welcome: values }));

    navigate("/user-profile");
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-primary-subtle rounded-t-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <User className="size-8 text-primary mr-2" />
            <CardTitle className="text-3xl font-extrabold text-primary">Bem-vindo(a) ao NutriDigital!</CardTitle>
          </div>
          <CardDescription className="text-center text-muted-foreground mt-2">
            Comece sua jornada para uma vida mais saudável preenchendo seus dados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6 border border-black rounded-b-xl">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex-1 bg-secondary p-4 rounded-lg flex items-center justify-center space-x-2 shadow-sm">
              <Users className="size-6 text-primary" />
              <p className="text-sm text-muted-foreground">
                Seus dados são usados para personalizar sua dieta.
              </p>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <User className="size-4 mr-2 text-primary" /> Nome Completo
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Mail className="size-4 mr-2 text-primary" /> E-mail
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="seu.email@exemplo.com" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 text-lg font-semibold">
                Continuar ➡️
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default WelcomeForm;