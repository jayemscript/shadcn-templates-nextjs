// src/components/customs/data-viewer/shared/toolbar/filters-dropdown.tsx
"use client";

import { ListFilterIcon } from "lucide-react";
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { FilterOption, FilterState, FilterValue } from "../../types/common";

const ALL_VALUE = "__all__";

interface FiltersDropdownProps {
  filterOptions: FilterOption[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FiltersDropdown({
  filterOptions,
  filters,
  onFiltersChange,
}: FiltersDropdownProps) {
  if (filterOptions.length === 0) return null;

  const activeCount = Object.keys(filters).length;

  const clearAll = () => onFiltersChange({});

  const setFilterValue = (key: string, value: FilterValue) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilterKey = (key: string) => {
    const next = { ...filters };
    delete next[key];
    onFiltersChange(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="shrink-0 cursor-pointer relative">
          <ListFilterIcon
            className="-ms-1 opacity-60"
            size={16}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground -me-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.625rem] font-medium ml-1">
              {activeCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Filters</DropdownMenuLabel>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 px-2 text-xs cursor-pointer hover:bg-accent"
            >
              Clear all
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto px-1">
          {filterOptions.map((filterOption) => (
            <div
              key={filterOption.key}
              className="px-2 py-2 border-t first:border-t-0"
            >
              <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                {filterOption.label}
              </Label>
              {filterOption.multiple ? (
                <MultiSelectFilter
                  filterOption={filterOption}
                  value={filters[filterOption.key]}
                  onSet={(value) => setFilterValue(filterOption.key, value)}
                  onRemove={() => removeFilterKey(filterOption.key)}
                />
              ) : (
                <SingleSelectFilter
                  filterOption={filterOption}
                  value={filters[filterOption.key]}
                  onSet={(value) => setFilterValue(filterOption.key, value)}
                  onRemove={() => removeFilterKey(filterOption.key)}
                />
              )}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface FilterFieldProps {
  filterOption: FilterOption;
  value: FilterValue | undefined;
  onSet: (value: FilterValue) => void;
  onRemove: () => void;
}

function MultiSelectFilter({
  filterOption,
  value,
  onSet,
  onRemove,
}: FilterFieldProps) {
  const currentValues = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-2">
      {filterOption.options.map((option) => {
        const isChecked = currentValues.includes(option.value);

        return (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${filterOption.key}-${option.value}`}
              checked={isChecked}
              onCheckedChange={(checked) => {
                const next = checked
                  ? [...currentValues, option.value]
                  : currentValues.filter((v) => v !== option.value);

                if (next.length > 0) {
                  onSet(next);
                } else {
                  onRemove();
                }
              }}
            />
            <label
              htmlFor={`${filterOption.key}-${option.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        );
      })}
    </div>
  );
}

function SingleSelectFilter({
  filterOption,
  value,
  onSet,
  onRemove,
}: FilterFieldProps) {
  const currentValue = typeof value === "string" ? value : ALL_VALUE;

  return (
    <Select
      value={currentValue}
      onValueChange={(next) => {
        if (next === ALL_VALUE) {
          onRemove();
        } else {
          onSet(next);
        }
      }}
    >
      <SelectTrigger className="w-full h-9 text-sm cursor-pointer">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE} className="text-sm cursor-pointer">
          All
        </SelectItem>
        {filterOption.options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-sm cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
