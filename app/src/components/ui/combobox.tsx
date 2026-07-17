import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type Option = {
  label: string;
  value: string;
};

type ComboboxProps = {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

export function ComboboxNoSearch({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  emptyText = "No options",
  disabled,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label ?? "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className={selectedLabel ? "" : "text-grey-400"}>
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start">
        {options.length === 0 ? (
          <p className="py-4 text-center text-sm text-grey-600">{emptyText}</p>
        ) : (
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  /* use onMouseDown so click fires before blur closes the popover */
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onValueChange?.(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm",
                    "text-[#121A38] transition-colors hover:bg-grey-100",
                    isSelected && "bg-grey-100 font-medium",
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-[#0058AB]",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
