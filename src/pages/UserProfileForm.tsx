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
import { AllFormData } from "@/utils/dietCalculations"; // Importar o tipo

// Esquema de validação com Zod
const formSchema = z.object({
  weight: z.coerce.number().min(20, "Peso deve ser no mínimo 20 kg").max(300, "Peso deve ser no máximo 300 kg"),
  age: z.coerce.number().min(1, "Idade deve ser no mínimo 1 ano").max(120, "Idade deve ser no máximo 120 anos"),
  height: z.coerce.number().min(50, "Altura deve ser no mínimo 50 cm").max(250, "Altura deve ser no máximo 250 cm"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Por favor, selecione seu gênero.",
  }),
});

const UserProfileForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      age: undefined,
      height: undefined,
      gender: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Dados do Perfil Coletados! ✅",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
    console.log("Dados do usuário:", values);

    // Salvar dados no localStorage
    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, profile: values }));

    // Navega para a próxima tela após a submissão
    navigate("/activity");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Suas Medidas Essenciais 📏</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Preencha suas informações para criar sua dieta personalizada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg) ⚖️</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 70" {...field} className="bg-input text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade 🎂</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 30" {...field} className="bg-input text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura (cm) ⬆️</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 175" {...field} className="bg-input text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero 🚻</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-input text-foreground">
                          <SelectValue placeholder="Selecione seu gênero" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover text-popover-foreground">
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full">
                  Voltar ⬅️
                </Button>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Próximo 💪
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

export default UserProfileForm;