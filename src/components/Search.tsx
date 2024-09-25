"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
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
import type { Category, Severity } from "@/lib/schema";
import { useStore } from "@nanostores/react";
import { categoryAtom, searchAtom, severityAtom } from "../lib/store";

type Props = {
  severities: Severity[];
  categories: Category[];
};

const useAtomStore = (atom: any) => {
  const value = useStore(atom);
  return [value, atom.set];
};

export default function Search({ severities, categories }: Props) {
  const [searchTerm, setSearchTerm] = useAtomStore(searchAtom);
  const [selectedCategories, setSelectedCategories] =
    useAtomStore(categoryAtom);
  const [selectedSeverities, setSelectedSeverities] =
    useAtomStore(severityAtom);

  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [tempSeverities, setTempSeverities] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const severityColors = useMemo(
    () =>
      severities.reduce(
        (acc, curr) => ({ ...acc, [curr.name]: curr.color }),
        {} as Record<string, string>,
      ),
    [severities],
  );

  const handleCategoryChange = (category: string) => {
    setTempCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleSeverityChange = (severity: string) => {
    setTempSeverities((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity],
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
    console.log(selectedCategories, selectedSeverities);
    setTempCategories(selectedCategories);
    setTempSeverities(selectedSeverities);
    setIsFilterOpen(true);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-white dark:border-slate-500 dark:bg-slate-700"
          />
          <Button
            onClick={openFilterDialog}
            variant="outline"
            className="bg-white dark:border-slate-500 dark:bg-slate-700"
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-4">
          {Object.entries(severityColors).map(([severity, color]) => (
            <div key={severity} className="flex items-center">
              <div
                className={`mr-2 h-3 w-3 rounded-full bg-${color}-500`}
              ></div>
              <span className="text-sm capitalize">{severity}</span>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="bg-white sm:max-w-[425px] dark:bg-slate-700">
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
                  <div
                    key={category.name}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.name}`}
                      checked={tempCategories.includes(category.name)}
                      onCheckedChange={() =>
                        handleCategoryChange(category.name)
                      }
                      className="bg-white"
                    />
                    <Label htmlFor={`category-${category.name}`}>
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Severity:</h3>
              <div className="grid grid-cols-2 gap-2">
                {severities.map((severity) => (
                  <div
                    key={severity.name}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`severity-${severity.name}`}
                      checked={tempSeverities.includes(severity.name)}
                      onCheckedChange={() =>
                        handleSeverityChange(severity.name)
                      }
                      className="bg-white"
                    />
                    <Label htmlFor={`severity-${severity.name}`}>
                      {severity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-white text-black dark:bg-slate-100"
              onClick={resetFilters}
            >
              Reset
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
