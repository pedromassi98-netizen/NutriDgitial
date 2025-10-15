"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import MultiSelectFoodCombobox from "@/components/MultiSelectFoodCombobox"; // Caminho corrigido
import { foodDatabase } from '../data/foodDatabase';
import { generateDietPlan } from '../utils/dietGenerator';
import { calculateBMR, calculateTDEE, adjustCaloriesForGoal, calculateMacronutrients } from '../utils/dietCalculations';
import { Meal } from '../utils/dietCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Schemas de validação
const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  age: z.number().min(18, "Você deve ter pelo menos 18 anos").max(100, "Idade inválida"),
  gender: z.enum(["male", "female"], { message: "Selecione o gênero" }),
  height: z.number().min(100, "Altura mínima de 100 cm").max(250, "Altura máxima de 250 cm"),
  weight: z.number().min(30, "Peso mínimo de 30 kg").max(300, "Peso máximo de 300 kg"),
});

const activitySchema = z.object({
  trainingLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"], { message: "Selecione o nível de atividade" }),
  trainingFrequency: z.number().min(0, "Mínimo de 0 dias").max(7, "Máximo de 7 dias"),
  trainingDuration: z.number().min(0, "Mínimo de 0 minutos").max(240, "Máximo de 240 minutos"),
});

const goalsSchema = z.object({
  goal: z.enum(["lose_weight", "maintain_weight", "gain_weight"], { message: "Selecione um objetivo" }),
  targetWeight: z.number().optional(),
});

const routineSchema = z.object({
  breakfastTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
  lunchTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
  snackTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)").optional(),
  dinnerTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
});

const foodPreferencesSchema = z.object({
  preferredBreakfastFoods: z.array(z.string()).optional(),
  preferredLunchFoods: z.array(z.string()).optional(),
  preferredSnackFoods: z.array(z.string()).optional(),
  preferredDinnerFoods: z.array(z.string()).optional(),
  preferredFruits: z.array(z.string()).optional(),
  preferredFats: z.array(z.string()).optional(),
  allergies: z.string().optional(),
  dislikedFoods: z.array(z.string()).optional(),
});

const formSchema = z.object({
  profile: profileSchema,
  activity: activitySchema,
  goals: goalsSchema,
  routine: routineSchema,
  foodPreferences: foodPreferencesSchema,
});

type FormData = z.infer<typeof formSchema>;

const foodOptions = foodDatabase.map(food => ({
  value: food.id,
  label: food.name,
}));

const getFoodOptionsByCategoryAndMealType = (category: FoodItem['category'] | FoodItem['category'][], mealType: FoodItem['mealTypes'][number]) => {
  const categoriesArray = Array.isArray(category) ? category : [category];
  return foodDatabase
    .filter(food =>
      categoriesArray.some(cat => food.category === cat) &&
      food.mealTypes.includes(mealType)
    )
    .map(food => ({
      value: food.id,
      label: food.name,
    }));
};

const getFruitOptions = () => foodDatabase.filter(food => food.category === 'fruit').map(food => ({ value: food.id, label: food.name }));
const getFatOptions = () => foodDatabase.filter(food => food.category === 'fat').map(food => ({ value: food.id, label: food.name }));

const WelcomeForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [dietPlan, setDietPlan] = useState<Meal[] | null>(null);
  const [totalDietCalories, setTotalDietCalories] = useState(0);
  const [totalDietProtein, setTotalDietProtein] = useState(0);
  const [totalDietCarbs, setTotalDietCarbs] = useState(0);
  const [totalDietFat, setTotalDietFat] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profile: {
        name: "",
        age: 25,
        gender: "male",
        height: 170,
        weight: 70,
      },
      activity: {
        trainingLevel: "moderate",
        trainingFrequency: 3,
        trainingDuration: 60,
      },
      goals: {
        goal: "maintain_weight",
        targetWeight: undefined,
      },
      routine: {
        breakfastTime: "08:00",
        lunchTime: "12:30",
        snackTime: "16:00",
        dinnerTime: "19:30",
      },
      foodPreferences: {
        preferredBreakfastFoods: [],
        preferredLunchFoods: [],
        preferredSnackFoods: [],
        preferredDinnerFoods: [],
        preferredFruits: [],
        preferredFats: [],
        allergies: "",
        dislikedFoods: [],
      },
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form Data Submitted:", data);
    try {
      const generatedPlan = generateDietPlan(data);
      if (generatedPlan) {
        setDietPlan(generatedPlan.meals);
        setTotalDietCalories(generatedPlan.totalCalories);
        setTotalDietProtein(generatedPlan.protein);
        setTotalDietCarbs(generatedPlan.carbs);
        setTotalDietFat(generatedPlan.fat);
        setStep(6); // Go to diet plan display
      } else {
        toast.error("Não foi possível gerar o plano de dieta. Verifique suas preferências.");
      }
    } catch (error) {
      console.error("Erro ao gerar plano de dieta:", error);
      toast.error("Ocorreu um erro ao gerar o plano de dieta.");
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger("profile");
    } else if (step === 2) {
      isValid = await form.trigger("activity");
    } else if (step === 3) {
      isValid = await form.trigger("goals");
    } else if (step === 4) {
      isValid = await form.trigger("routine");
    } else if (step === 5) {
      isValid = await form.trigger("foodPreferences");
    }

    if (isValid) {
      setStep((prev) => prev + 1);
    } else {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-800">Seu Perfil</h2>
            <p className="text-center text-gray-600 mb-8">Conte-nos um pouco sobre você para começarmos.</p>
            <FormField
              control={form.control}
              name="profile.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profile.age"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Idade</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Sua idade" onChange={e => onChange(parseInt(e.target.value))} value={value} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" {...rest} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profile.gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Gênero</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Selecione seu gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profile.height"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Altura (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Sua altura em cm" onChange={e => onChange(parseInt(e.target.value))} value={value} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" {...rest} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profile.weight"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Peso (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Seu peso em kg" onChange={e => onChange(parseInt(e.target.value))} value={value} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" {...rest} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-800">Seu Nível de Atividade</h2>
            <p className="text-center text-gray-600 mb-8">Para calcular suas necessidades calóricas diárias.</p>
            <FormField
              control={form.control}
              name="activity.trainingLevel"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-medium text-gray-700">Nível de Atividade Física</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="sedentary" />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">
                          Sedentário (pouco ou nenhum exercício)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="light" />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">
                          Leve (exercício leve 1-3 dias/semana)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="moderate" />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">
                          Moderado (exercício moderado 3-5 dias/semana)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="active" />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">
                          Ativo (exercício intenso 6-7 dias/semana)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="very_active" />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">
                          Muito Ativo (exercício muito intenso, 2x ao dia)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activity.trainingFrequency"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Frequência de Treino (dias/semana)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={7}
                      step={1}
                      value={[value]}
                      onValueChange={(val) => onChange(val[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="text-right text-sm text-gray-500">{value} dias/semana</div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activity.trainingDuration"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Duração Média do Treino (minutos)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={240}
                      step={15}
                      value={[value]}
                      onValueChange={(val) => onChange(val[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="text-right text-sm text-gray-500">{value} minutos</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-800">Seus Objetivos</h2>
            <p className="text-center text-gray-600 mb-8">O que você busca alcançar com sua dieta?</p>
            <FormField
              control={form.control}
              name="goals.goal"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-medium text-gray-700">Objetivo Principal</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="lose_weight" />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">
                          Perder Peso
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="maintain_weight" />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">
                          Manter Peso
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="gain_weight" />
                        </FormControl>
                        <FormLabel className="font-normal text-gray-700">
                          Ganhar Peso / Massa Muscular
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("goals.goal") === "lose_weight" && (
              <FormField
                control={form.control}
                name="goals.targetWeight"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-gray-700">Peso Alvo (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 65" onChange={e => onChange(parseInt(e.target.value))} value={value || ''} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" {...rest} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-800">Sua Rotina Diária</h2>
            <p className="text-center text-gray-600 mb-8">Defina os horários das suas refeições.</p>
            <FormField
              control={form.control}
              name="routine.breakfastTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Horário do Café da Manhã</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="routine.lunchTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Horário do Almoço</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="routine.snackTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Horário do Lanche (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="routine.dinnerTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Horário do Jantar</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-800">Suas Preferências Alimentares</h2>
            <p className="text-center text-gray-600 mb-8">Ajude-nos a personalizar sua dieta.</p>
            <FormField
              control={form.control}
              name="foodPreferences.preferredBreakfastFoods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Alimentos Preferidos para o Café da Manhã</FormLabel>
                  <FormControl>
                    <MultiSelectFoodCombobox
                      value={field.value || []}
                      onChange={field.onChange}
                      options={getFoodOptionsByCategoryAndMealType(['protein', 'carb', 'dairy'], 'breakfast')}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodPreferences.preferredLunchFoods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Alimentos Preferidos para o Almoço</FormLabel>
                  <FormControl>
                    <MultiSelectFoodCombobox
                      value={field.value || []}
                      onChange={field.onChange}
                      options={getFoodOptionsByCategoryAndMealType(['protein', 'carb', 'legume'], 'lunch')}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("routine.snackTime") && (
              <FormField
                control={form.control}
                name="foodPreferences.preferredSnackFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-gray-700">Alimentos Preferidos para o Lanche</FormLabel>
                    <FormControl>
                      <MultiSelectFoodCombobox
                        value={field.value || []}
                        onChange={field.onChange}
                        options={getFoodOptionsByCategoryAndMealType(['protein', 'carb', 'dairy', 'fruit'], 'snack')}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="foodPreferences.preferredDinnerFoods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Alimentos Preferidos para o Jantar</FormLabel>
                  <FormControl>
                    <MultiSelectFoodCombobox
                      value={field.value || []}
                      onChange={field.onChange}
                      options={getFoodOptionsByCategoryAndMealType(['protein', 'carb', 'legume'], 'dinner')}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodPreferences.preferredFruits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Frutas Preferidas</FormLabel>
                  <FormControl>
                    <MultiSelectFoodCombobox
                      value={field.value || []}
                      onChange={field.onChange}
                      options={getFruitOptions()}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodPreferences.preferredFats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Fontes de Gordura Saudável Preferidas</FormLabel>
                  <FormControl>
                    <MultiSelectFoodCombobox
                      value={field.value || []}
                      onChange={field.onChange}
                      options={getFatOptions()}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodPreferences.allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Alergias ou Restrições Alimentares</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Glúten, Lactose, Amendoim" {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodPreferences.dislikedFoods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700">Alimentos que Não Gosta</FormLabel>
                  <FormControl>
                    <MultiSelectFoodCombobox
                      value={field.value || []}
                      onChange={field.onChange}
                      options={foodOptions}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 6:
        if (!dietPlan) {
          return (
            <div className="text-center text-red-500 text-xl">
              Não foi possível gerar o plano de dieta. Por favor, tente novamente.
            </div>
          );
        }
        return (
          <div className="space-y-8">
            <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4">Seu Plano de Dieta Personalizado!</h2>
            <p className="text-center text-gray-700 text-lg mb-8">Aqui está a sua sugestão de dieta, adaptada às suas necessidades e preferências.</p>

            <Card className="shadow-lg border-l-4 border-blue-500">
              <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-blue-800">Resumo Diário</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Calorias</p>
                  <p className="text-xl font-semibold text-gray-900">{totalDietCalories} kcal</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Proteína</p>
                  <p className="text-xl font-semibold text-gray-900">{totalDietProtein}g</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Carboidratos</p>
                  <p className="text-xl font-semibold text-gray-900">{totalDietCarbs}g</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gorduras</p>
                  <p className="text-xl font-semibold text-gray-900">{totalDietFat}g</p>
                </div>
              </CardContent>
            </Card>

            {dietPlan.map((meal, index) => (
              <Card key={index} className="shadow-md">
                <CardHeader className="bg-gray-50 p-4 rounded-t-lg">
                  <CardTitle className="text-xl font-semibold text-gray-800 flex justify-between items-center">
                    <span>{meal.name} ({meal.time})</span>
                    <span className="text-base font-normal text-gray-600">{meal.totalMealCalories} kcal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="list-disc pl-5 space-y-3">
                    {meal.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-700 text-base">
                        <span className="font-medium">{item.food}:</span> {item.quantity}
                        {item.substitutions && item.substitutions.length > 0 && (
                          <div className="text-sm text-gray-500 mt-1 ml-4">
                            <span className="font-normal">Substituições:</span> {item.substitutions.join('; ')}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Macros da Refeição:</span>
                    <span>P: {meal.totalMealProtein}g | C: {meal.totalMealCarbs}g | G: {meal.totalMealFat}g</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="text-center mt-10">
              <Button onClick={() => setStep(1)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out">
                Gerar Novo Plano
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-3xl shadow-2xl rounded-xl p-6 sm:p-8 lg:p-10 bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderStep()}

            <div className="flex justify-between mt-8">
              {step > 1 && step < 6 && (
                <Button type="button" onClick={prevStep} className="bg-gray-300 text-gray-800 hover:bg-gray-400 rounded-md py-2 px-4 text-lg font-semibold">
                  ⬅️ Voltar
                </Button>
              )}
              {step < 5 && (
                <Button type="button" onClick={nextStep} className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 px-4 text-lg font-semibold">
                  Próximo ➡️
                </Button>
              )}
              {step === 5 && (
                <Button type="submit" className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 px-4 text-lg font-semibold">
                  Seguir para minha transformação
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default WelcomeForm;