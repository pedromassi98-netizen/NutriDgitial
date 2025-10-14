"use client";

import * as React from "react";
import { Check, ChevronsUpDown, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { foodDatabase, FoodItem } from "@/data/foodDatabase";

interface MultiSelectFoodComboboxProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  mealTypeFilter?: FoodItem['mealTypes'][number];
  categoryFilter?: FoodItem['category']; // Nova prop para filtrar por categoria
}

const MultiSelectFoodCombobox: React.FC<MultiSelectFoodComboboxProps> = ({
  value,
  onChange,
  placeholder = "Selecione alimentos...",
  label,
  mealTypeFilter,
  categoryFilter, // Usar a nova prop
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedFoods, setSelectedFoods] = React.useState<string[]>(value);

  React.useEffect(() => {
    setSelectedFoods(value);
  }, [value]);

  const handleSelect = (foodId: string) => {
    let newSelection: string[];

    if (foodId === 'none_fruits') {
      // Se 'Nenhuma fruta' for selecionada
      if (selectedFoods.includes('none_fruits')) {
        // Se já estiver selecionada, desmarcar
        newSelection = selectedFoods.filter((id) => id !== 'none_fruits');
      } else {
        // Se não estiver selecionada, marcar e desmarcar todas as outras frutas
        newSelection = ['none_fruits'];
      }
    } else {
      // Se outra fruta for selecionada
      if (selectedFoods.includes(foodId)) {
        // Se já estiver selecionada, desmarcar
        newSelection = selectedFoods.filter((id) => id !== foodId);
      } else {
        // Se não estiver selecionada, marcar e desmarcar 'Nenhuma fruta'
        newSelection = [...selectedFoods.filter((id) => id !== 'none_fruits'), foodId];
      }
    }
    setSelectedFoods(newSelection);
    onChange(newSelection);
  };

  const handleRemove = (foodId: string) => {
    const newSelection = selectedFoods.filter((id) => id !== foodId);
    setSelectedFoods(newSelection);
    onChange(newSelection);
  };

  const availableFoods = foodDatabase
    .filter(food => {
      // Se houver um filtro de tipo de refeição, e o alimento não deve ser exibido na seleção de tipo de refeição, exclua-o.
      if (mealTypeFilter && food.displayInMealTypeSelection === false) {
        return false;
      }
      // Filtra por tipo de refeição se especificado
      if (mealTypeFilter && !food.mealTypes.includes(mealTypeFilter)) {
        return false;
      }
      // Filtra por categoria se especificado
      if (categoryFilter && food.category !== categoryFilter) {
        return false;
      }
      return true;
    })
    .map((food) => ({
      value: food.id,
      label: food.name,
    }));

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</p>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-input text-foreground border-border h-auto min-h-10"
          >
            <div className="flex flex-wrap gap-1">
              {selectedFoods.length > 0 ? (
                selectedFoods.map((foodId) => {
                  const food = foodDatabase.find((f) => f.id === foodId);
                  return food ? (
                    <Badge key={foodId} variant="secondary" className="flex items-center">
                      {food.name}
                      <XCircle
                        className="ml-1 size-3 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(foodId);
                        }}
                      />
                    </Badge>
                  ) : null;
                })
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover text-popover-foreground">
          <Command>
            <CommandInput placeholder="Buscar alimento..." />
            <CommandList>
              <CommandEmpty>Nenhum alimento encontrado.</CommandEmpty>
              <CommandGroup>
                {availableFoods.map((food) => (
                  <CommandItem
                    key={food.value}
                    value={food.label}
                    onSelect={() => handleSelect(food.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        selectedFoods.includes(food.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {food.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelectFoodCombobox;