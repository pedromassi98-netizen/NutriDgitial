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
import { CheckCircle2, Users, Star } from "lucide-react"; // Importar ícones

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  phone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Por favor, insira um telefone válido (ex: (XX) 9XXXX-XXXX).").optional().or(z.literal('')),
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
    // Removido o toast de sucesso
    console.log("Dados de contato do usuário:", values);

    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, welcome: values }));

    navigate("/profile");
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-primary-subtle rounded-t-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <CardTitle className="text-3xl font-extrabold text-primary">
              NutriDigital
            </CardTitle>
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">
            Seu Nutricionista Digital 24h 🍏
          </p>
          <CardDescription className="text-center text-muted-foreground">
            Sua jornada para uma vida mais saudável e feliz começa aqui! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex-1 bg-secondary p-4 rounded-lg flex items-center justify-center space-x-2 shadow-sm">
              <Users className="size-6 text-primary" />
              <p className="text-lg font-semibold text-foreground">+15 mil de transformados</p>
            </div>
            <div className="flex-1 bg-secondary p-4 rounded-lg flex items-center justify-center space-x-2 shadow-sm">
              <Star className="size-6 text-primary" />
              <p className="text-lg font-semibold text-foreground">4,95 avaliação</p>
            </div>
          </div>

          <div className="bg-info p-4 rounded-md space-y-2 text-info-foreground">
            <h3 className="font-bold text-lg flex items-center">
              <CheckCircle2 className="size-5 mr-2" /> GARANTIA TOTAL
            </h3>
            <ul className="list-none space-y-1 text-sm">
              <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-primary" /> Transformação comprovada em 30 dias! 🚀</li>
              <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-primary" /> Método aprovado por nutricionistas! ✅</li>
              <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-primary" /> Aprovado por milhares de clientes! 🌟</li>
            </ul>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} className="bg-input text-foreground border-border" />
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
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seuemail@exemplo.com" {...field} className="bg-input text-foreground border-border" />
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
                    <FormLabel>Whatsapp</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(XX) 9XXXX-XXXX" {...field} className="bg-input text-foreground border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 text-lg font-semibold">
                Começar agora sua transformação! 💪
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