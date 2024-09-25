"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Food, Severity } from "@/lib/schema";
import { useStore } from "@nanostores/react";
import { categoryAtom, searchAtom, severityAtom } from "@/lib/store";

type Props = {
  diet: Food[];
  severities: Severity[];
};

export default function FoodList({ diet: foods, severities }: Props) {
  const searchTerm = useStore(searchAtom);
  const selectedCategories = useStore(categoryAtom);
  const selectedSeverities = useStore(severityAtom);

  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const severityColors = useMemo(
    () =>
      severities.reduce(
        (acc, curr) => ({ ...acc, [curr.name]: curr.color }),
        {} as Record<string, string>,
      ),
    [severities],
  );

  const severityOrder = useMemo(
    () => severities.sort((a, b) => b.order - a.order).map((x) => x.name),
    [severities],
  );

  const filteredFoods = useMemo(() => {
    return foods.filter(
      (food) =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategories.length === 0 ||
          selectedCategories.includes(food.category)) &&
        (selectedSeverities.length === 0 ||
          selectedSeverities.includes(food.severity)),
    );
  }, [searchTerm, selectedCategories, selectedSeverities]);

  const groupedFoods = useMemo(() => {
    return filteredFoods.reduce(
      (acc, food) => {
        if (!acc[food.category]) {
          acc[food.category] = [];
        }
        acc[food.category].push(food);
        return acc;
      },
      {} as Record<string, Food[]>,
    );
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
          severityOrder.indexOf(f.severity) > currentSeverityIndex,
      )
      .sort(
        (a, b) =>
          severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
      );
  };

  return (
    <>
      {Object.entries(groupedFoods).map(([category, foods]) => (
        <div key={category} className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {foods.map((food) => (
              <Card
                key={food.name}
                className="flex cursor-pointer overflow-hidden bg-white transition-shadow hover:shadow-md dark:border-slate-500 dark:bg-slate-700 dark:text-white"
                onClick={() => handleFoodClick(food)}
              >
                <div
                  className={`w-2 bg-${severityColors[food.severity]}-500`}
                ></div>
                <CardContent className="flex flex-grow items-center justify-between p-4">
                  <h3 className="text-lg font-semibold">
                    {food.name} {food.notes && "*"}
                  </h3>

                  <Badge
                    variant="outline"
                    className={`bg-${severityColors[food.severity]}-500 text-white`}
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
        <p className="mt-8 text-center text-gray-500">
          No foods match your current filters.
        </p>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-800">
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
                  className="flex items-center justify-between"
                >
                  <span>{alt.name}</span>
                  <Badge
                    className={`bg-${severityColors[alt.severity]}-500 text-white`}
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
    </>
  );
}
