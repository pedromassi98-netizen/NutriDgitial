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
  CardFooter, // Importar CardFooter
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
import { User, Mail, Phone } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  phone: z.string().optional(),
});

const WelcomeForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Dados de boas-vindas:", values);

    // Salva os dados no localStorage
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ welcome: values }));

    navigate("/profile");
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-primary-subtle rounded-t-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <User className="size-8 text-primary mr-2" />
            <CardTitle className="text-3xl font-extrabold text-primary">Bem-vindo(a) à NutriDigital!</CardTitle>
          </div>
          <CardDescription className="text-center text-muted-foreground">
            Comece sua jornada para uma vida mais saudável.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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
                      <Input type="email" placeholder="seu.email@exemplo.com" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Phone className="size-4 mr-2 text-primary" /> Telefone (opcional)
                    </FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(XX) XXXXX-XXXX" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 text-lg font-semibold">
                Começar Minha Dieta! ✨
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="bg-warning p-4 rounded-b-xl text-warning-foreground text-base text-left space-y-3">
          <h3 className="font-bold text-base mb-1">Aviso Importante</h3>
          <p>Este aplicativo utiliza inteligência artificial para gerar sugestões de dietas e não substitui o acompanhamento de um nutricionista, médico ou outro profissional de saúde qualificado.</p>
          <p>As informações fornecidas são apenas para fins educacionais e informativos. Não devem ser interpretadas como aconselhamento médico, diagnóstico ou tratamento.</p>
          <p>Antes de iniciar qualquer dieta ou fazer mudanças significativas em sua alimentação, consulte um profissional de saúde, especialmente se você tiver condições médicas pré-existentes, alergias alimentares, estiver grávida ou amamentando.</p>
          <p>Ao usar este aplicativo, você reconhece e concorda que assume total responsabilidade por suas escolhas alimentares e de saúde.</p>
        </CardFooter>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default WelcomeForm;