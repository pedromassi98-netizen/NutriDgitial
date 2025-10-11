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
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";
import { AllFormData } from "@/utils/dietCalculations";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  hasRestrictions: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione se você possui restrições alimentares.",
  }),
  restrictions: z.array(z.string()).optional(),
});

const DietaryRestrictionsForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasRestrictions: undefined,
      restrictions: [],
    },
  });

  const hasRestrictions = form.watch("hasRestrictions");

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Dados de Restrições Alimentares Salvos!",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
    console.log("Dados de restrições alimentares do usuário:", values);

    const currentData: AllFormData = JSON.parse(localStorage.getItem("nutriDigitalFormData") || "{}");
    localStorage.setItem("nutriDigitalFormData", JSON.stringify({ ...currentData, restrictions: values }));

    navigate("/health-goals");
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-xl rounded-xl border-none">
        <CardHeader className="bg-accent rounded-t-xl p-6 text-center">
          <CardTitle className="text-3xl font-extrabold text-primary mb-2">
            Restrições Alimentares 🚫
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Informe-nos sobre quaisquer restrições ou preferências alimentares.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="hasRestrictions"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">Você possui alguma restrição alimentar?</FormLabel>
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
                            <RadioGroupItem value="yes" id="restrictions-yes" className="sr-only" />
                          </FormControl>
                          <FormLabel htmlFor="restrictions-yes" className="font-normal text-lg cursor-pointer">
                            Sim
                          </FormLabel>
                        </FormItem>
                        <FormItem
                          className={`flex items-center space-x-2 space-y-0 bg-secondary p-3 rounded-md flex-1 justify-center cursor-pointer transition-all duration-200 ${
                            field.value === "no" ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                          }`}
                        >
                          <FormControl>
                            <RadioGroupItem value="no" id="restrictions-no" className="sr-only" />
                          </FormControl>
                          <FormLabel htmlFor="restrictions-no" className="font-normal text-lg cursor-pointer">
                            Não
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasRestrictions === "yes" && (
                <FormField
                  control={form.control}
                  name="restrictions"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-lg font-semibold">Quais restrições você possui?</FormLabel>
                        <CardDescription className="text-muted-foreground">
                          Selecione todas as opções que se aplicam.
                        </CardDescription>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          "Vegetariano",
                          "Vegano",
                          "Sem Glúten",
                          "Sem Lactose",
                          "Sem Açúcar",
                          "Alergia a Amendoim",
                          "Alergia a Frutos do Mar",
                          "Outros",
                        ].map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="restrictions"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0 bg-secondary p-3 rounded-md"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 text-lg font-semibold">
                Continuar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default DietaryRestrictionsForm;