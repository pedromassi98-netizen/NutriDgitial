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
import { CheckCircle2, Star, Zap } from "lucide-react"; // Importar ícones

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
    toast({
      title: "Bem-vindo(a) ao Mais Fit! 🎉",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
    console.log("Dados de contato do usuário:", values);

    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, welcome: values }));

    navigate("/profile");
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-accent rounded-t-xl p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Zap className="size-8 text-primary mr-2" />
            <CardTitle className="text-3xl font-extrabold text-primary">
              Mais Fit
            </CardTitle>
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">
            Sua transformação começa AGORA!
          </p>
          <CardDescription className="text-center text-muted-foreground space-y-1">
            <p className="flex items-center justify-center text-sm">
              <Zap className="size-4 text-primary mr-1" /> +15.000 transformações
              <Star className="size-4 text-yellow-500 ml-2 mr-1" fill="currentColor" /> 4.9/5 avaliação
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-info p-4 rounded-md space-y-2 text-info-foreground">
            <h3 className="font-bold text-lg flex items-center">
              <CheckCircle2 className="size-5 mr-2" /> GARANTIA TOTAL
            </h3>
            <ul className="list-none space-y-1 text-sm">
              <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-primary" /> Transformação comprovada em 30 dias</li>
              <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-primary" /> Método aprovado por nutricionistas</li>
              <li className="flex items-center"><CheckCircle2 className="size-4 mr-2 text-primary" /> Suporte completo via WhatsApp</li>
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
                Começar Minha Transformação! 🚀
              </Button>
            </form>
          </Form>
          <div className="bg-warning p-4 rounded-md text-warning-foreground text-center">
            <p className="font-semibold">ÚLTIMAS VAGAS!</p>
            <p className="text-sm">Apenas <span className="font-bold">47 vagas</span> restantes hoje</p>
            <p className="text-xs">Preço promocional válido por tempo limitado.</p>
          </div>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default WelcomeForm;