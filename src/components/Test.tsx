"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterIcon } from "lucide-react";

const severityColors = {
  allowed: "bg-green-500",
  limited: "bg-yellow-500",
  "should avoid": "bg-red-500",
};

const severityOrder = ["should avoid", "limited", "allowed"];

type Food = {
  name: string;
  category: string;
  severity: string;
  notes: string;
};

type Props = {
  data: Food[];
};

export default function FoodSeverityApp({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [tempSeverities, setTempSeverities] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const foods = data;
  const categories = [...new Set(foods.map((i) => i.category))];
  const severityLevels = [...new Set(foods.map((i) => i.severity))];

  const filteredFoods = useMemo(() => {
    return foods.filter(
      (food) =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategories.length === 0 ||
          selectedCategories.includes(food.category)) &&
        (selectedSeverities.length === 0 ||
          selectedSeverities.includes(food.severity))
    );
  }, [searchTerm, selectedCategories, selectedSeverities]);

  const groupedFoods = useMemo(() => {
    return filteredFoods.reduce((acc, food) => {
      if (!acc[food.category]) {
        acc[food.category] = [];
      }
      acc[food.category].push(food);
      return acc;
    }, {} as Record<string, Food[]>);
  }, [filteredFoods]);

  const handleFoodClick = (food: Food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  const getBetterAlternatives = (food: Food) => {
    const currentSeverityIndex = severityOrder.indexOf(food.severity);
    return foods
      .filter(
        (f) =>
          f.category === food.category &&
          severityOrder.indexOf(f.severity) > currentSeverityIndex
      )
      .sort(
        (a, b) =>
          severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
      );
  };

  const handleCategoryChange = (category: string) => {
    setTempCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSeverityChange = (severity: string) => {
    setTempSeverities((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity]
    );
  };

  const applyFilters = () => {
    setSelectedCategories(tempCategories);
    setSelectedSeverities(tempSeverities);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setTempCategories([]);
    setTempSeverities([]);
  };

  const openFilterDialog = () => {
    setTempCategories(selectedCategories);
    setTempSeverities(selectedSeverities);
    setIsFilterOpen(true);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Food Consumption Severity</h1>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={openFilterDialog} variant="outline">
            <FilterIcon className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="flex gap-4 items-center justify-start flex-wrap">
          {Object.entries(severityColors).map(([severity, color]) => (
            <div key={severity} className="flex items-center">
              <div className={`w-3 h-3 ${color} rounded-full mr-2`}></div>
              <span className="capitalize text-sm">{severity}</span>
            </div>
          ))}
        </div>
      </div>

      {Object.entries(groupedFoods).map(([category, foods]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {foods.map((food) => (
              <Card
                key={food.name}
                className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden flex"
                onClick={() => handleFoodClick(food)}
              >
                <div className={`w-2 ${severityColors[food.severity]}`}></div>
                <CardContent className="p-4 flex-grow flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {food.name} {food.notes && "*"}
                  </h3>

                  <Badge
                    variant="outline"
                    className={`${severityColors[food.severity]} bg-opacity-20`}
                  >
                    {food.severity}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(groupedFoods).length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No foods match your current filters.
        </p>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedFood?.name}</DialogTitle>
            <DialogDescription>
              Category: {selectedFood?.category}, Severity:{" "}
              {selectedFood?.severity}
            </DialogDescription>
          </DialogHeader>
          {selectedFood?.notes && (
            <>
              <h3 className="text-lg font-semibold">Notes:</h3>
              <p>{selectedFood?.notes}</p>
            </>
          )}

          <h3 className="text-lg font-semibold">Better Alternatives:</h3>
          {selectedFood && getBetterAlternatives(selectedFood).length > 0 ? (
            <ul className="space-y-2">
              {getBetterAlternatives(selectedFood).map((alt) => (
                <li
                  key={alt.name}
                  className="flex justify-between items-center"
                >
                  <span>{alt.name}</span>
                  <Badge
                    className={`${severityColors[alt.severity]} text-white`}
                  >
                    {alt.severity}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p>No better alternatives found in this category.</p>
          )}
          <Button onClick={() => setIsModalOpen(false)} className="mt-4">
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Options</DialogTitle>
            <DialogDescription>
              Select categories and severity levels to filter the food items.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Categories:</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={tempCategories.includes(category)}
                      onCheckedChange={() => handleCategoryChange(category)}
                    />
                    <Label htmlFor={`category-${category}`}>{category}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Severity:</h3>
              <div className="grid grid-cols-2 gap-2">
                {severityLevels.map((severity) => (
                  <div key={severity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`severity-${severity}`}
                      checked={tempSeverities.includes(severity)}
                      onCheckedChange={() => handleSeverityChange(severity)}
                    />
                    <Label htmlFor={`severity-${severity}`}>{severity}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
