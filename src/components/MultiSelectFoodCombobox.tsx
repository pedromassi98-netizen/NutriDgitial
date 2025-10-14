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
  mealTypeFilter?: FoodItem['mealTypes'][number]; // Nova prop
}

const MultiSelectFoodCombobox: React.FC<MultiSelectFoodComboboxProps> = ({
  value,
  onChange,
  placeholder = "Selecione alimentos...",
  label,
  mealTypeFilter, // Usar a nova prop
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedFoods, setSelectedFoods] = React.useState<string[]>(value);

  React.useEffect(() => {
    setSelectedFoods(value);
  }, [value]);

  const handleSelect = (foodId: string) => {
    const isSelected = selectedFoods.includes(foodId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedFoods.filter((id) => id !== foodId);
    } else {
      newSelection = [...selectedFoods, foodId];
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
    .filter(food => mealTypeFilter ? food.mealTypes.includes(mealTypeFilter) : true) // Filtrar por mealType
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