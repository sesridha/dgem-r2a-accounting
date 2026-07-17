"use client";

import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md";

export type AutoCompleteOption = Record<string, unknown>; // generic shape

export interface AutoCompleteProps<TOption extends AutoCompleteOption> {
  /** The list of options to display (required) */
  options: TOption[];

  /** Controlled selected option id/value */
  value?: string;
  /** Called when selection changes; provides both id and full option */
  onChange?: (value: string, option: TOption | undefined) => void;

  /** Enable multi-select mode (default: false) */
  multiSelect?: boolean;
  /** Controlled selected option ids in multi-select mode */
  values?: string[];
  /** Called when selected values change in multi-select mode */
  onValuesChange?: (values: string[], options: TOption[]) => void;
  /** Show a Select All option in multi-select mode */
  enableSelectAll?: boolean;
  /** Label for Select All option */
  selectAllLabel?: string;

  /** Controlled text in the input field */
  inputValue: string;
  onInputChange: (text: string) => void;

  /** Extract a unique string value from each option (required) */
  getOptionValue: (option: TOption) => string;
  /** Extract a text label for the input + item value (required) */
  getOptionLabel: (option: TOption) => string;

  /** Optional custom renderer for each option row */
  renderOption?: (option: TOption, isSelected: boolean) => React.ReactNode;

  /** UX */
  placeholder?: string;
  className?: string;

  /** Label & a11y */
  id?: string;
  label?: string;
  labelHint?: string;
  required?: boolean;
  helperText?: string;
  errorText?: string;

  /** End icon: clear button when there is text */
  clearable?: boolean;

  /** Close the menu after selecting an item */
  closeOnSelect?: boolean;

  /** Popper max height (scrolls when overflow); default 200px */
  maxListHeight?: number;

  /** Size of items/input */
  size?: Size;

  /** Called when a dialog (or anything) should open after selection (optional) */
  onAfterSelectOpenDialog?: () => void;

  /** Whether to always show all (no filtering). Default: true */
  disableFiltering?: boolean;
}

/**
 * Generic AutoComplete – no cmdk dependency
 * - No filtering by default (shows all options)
 * - Controlled input text + controlled selected value
 * - Clearable action and dropdown toggle icon
 * - Label, helper, error, a11y attributes
 * - Custom renderOption support
 */
export function AutoCompleteInput<TOption extends AutoCompleteOption>({
  options,
  value,
  onChange,
  multiSelect = false,
  values = [],
  onValuesChange,
  enableSelectAll = false,
  selectAllLabel = "Select All",
  inputValue,
  onInputChange,
  getOptionValue,
  getOptionLabel,
  renderOption,
  placeholder = "Type to search…",
  className,

  // label props
  id,
  label,
  labelHint,
  required = false,
  helperText,
  errorText,

  clearable = false,
  closeOnSelect = true,
  maxListHeight = 200,
  size = "sm",
  onAfterSelectOpenDialog,
  disableFiltering = true,
}: AutoCompleteProps<TOption>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const multiSelectContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [multiSelectContainerWidth, setMultiSelectContainerWidth] =
    React.useState(0);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((o) => !o), []);

  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  const showClearIcon = clearable && !!inputValue;

  const selectedValues = React.useMemo(
    () => (multiSelect ? values : value ? [value] : []),
    [multiSelect, values, value],
  );

  const selectedSet = React.useMemo(
    () => new Set(selectedValues),
    [selectedValues],
  );

  const optionByValue = React.useMemo(() => {
    const map = new Map<string, TOption>();
    options.forEach((opt) => {
      map.set(getOptionValue(opt), opt);
    });
    return map;
  }, [options, getOptionValue]);

  const selectedOptions = React.useMemo(
    () =>
      selectedValues
        .map((val) => optionByValue.get(val))
        .filter(Boolean) as TOption[],
    [selectedValues, optionByValue],
  );

  React.useEffect(() => {
    if (
      !multiSelect ||
      !multiSelectContainerRef.current ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }

    const element = multiSelectContainerRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setMultiSelectContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(element);
    setMultiSelectContainerWidth(element.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, [multiSelect]);

  const getTextWidth = React.useCallback((text: string) => {
    if (typeof document === "undefined") return text.length * 7;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return text.length * 7;
    context.font = "500 12px Inter, system-ui, sans-serif";
    return context.measureText(text).width;
  }, []);

  const estimateChipWidth = React.useCallback(
    (label: string) => {
      const textWidth = getTextWidth(label);
      const paddedTextWidth = Math.min(textWidth, 144);
      return Math.max(56, Math.ceil(paddedTextWidth + 44));
    },
    [getTextWidth],
  );

  const estimateOverflowChipWidth = React.useCallback(
    (count: number) => {
      const countWidth = getTextWidth(`+${count}`);
      return Math.max(36, Math.ceil(countWidth + 24));
    },
    [getTextWidth],
  );

  const visibleChipCount = React.useMemo(() => {
    if (!multiSelect) return selectedOptions.length;
    if (!selectedOptions.length) return 0;

    const gapWidth = 4;
    const inputReservedWidth = 72;
    const availableWidth = Math.max(
      multiSelectContainerWidth - inputReservedWidth,
      0,
    );
    if (availableWidth <= 0) return 0;

    let usedWidth = 0;
    let visibleCount = 0;

    for (let index = 0; index < selectedOptions.length; index += 1) {
      const option = selectedOptions[index];
      const chipWidth = estimateChipWidth(getOptionLabel(option));
      const nextVisibleCount = index + 1;
      const remainingCount = selectedOptions.length - nextVisibleCount;
      const overflowWidth =
        remainingCount > 0
          ? estimateOverflowChipWidth(remainingCount) + gapWidth
          : 0;
      const nextUsed = usedWidth + chipWidth + gapWidth + overflowWidth;

      if (nextUsed <= availableWidth) {
        usedWidth += chipWidth + gapWidth;
        visibleCount = nextVisibleCount;
      } else {
        break;
      }
    }

    return visibleCount;
  }, [
    estimateChipWidth,
    estimateOverflowChipWidth,
    getOptionLabel,
    multiSelect,
    multiSelectContainerWidth,
    selectedOptions,
  ]);

  const visibleSelectedOptions = React.useMemo(
    () =>
      multiSelect
        ? selectedOptions.slice(0, visibleChipCount)
        : selectedOptions,
    [multiSelect, selectedOptions, visibleChipCount],
  );

  const hiddenSelectedCount = React.useMemo(
    () =>
      multiSelect
        ? Math.max(selectedOptions.length - visibleSelectedOptions.length, 0)
        : 0,
    [multiSelect, selectedOptions.length, visibleSelectedOptions.length],
  );

  const hiddenSelectedLabels = React.useMemo(
    () =>
      selectedOptions
        .slice(visibleSelectedOptions.length)
        .map((opt) => getOptionLabel(opt)),
    [selectedOptions, visibleSelectedOptions.length, getOptionLabel],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") close();
    if (e.key === "Enter" && !isOpen) open();
  };

  const items = React.useMemo(() => {
    if (disableFiltering) return options;
    const q = inputValue.trim().toLowerCase();
    if (!q) return options;
    // Default fallback filtering using label if you later enable it
    return options.filter((opt) =>
      getOptionLabel(opt).toLowerCase().includes(q),
    );
  }, [options, disableFiltering, inputValue, getOptionLabel]);

  const selectableValues = React.useMemo(
    () => items.map((opt) => getOptionValue(opt)),
    [items, getOptionValue],
  );

  const allSelected = React.useMemo(
    () =>
      multiSelect &&
      selectableValues.length > 0 &&
      selectableValues.every((val) => selectedSet.has(val)),
    [multiSelect, selectableValues, selectedSet],
  );

  // Track whether the user is actively clearing via the X button
  const isClearingRef = React.useRef(false);

  // Close the list when input is emptied — but NOT when the user clicks clear
  // (so they can immediately pick a new option without extra clicks)
  React.useEffect(() => {
    if (!inputValue && !isClearingRef.current) close();
  }, [inputValue, close]);

  const handleClear = (e?: React.MouseEvent) => {
    e?.preventDefault();
    isClearingRef.current = true;
    onInputChange("");
    if (multiSelect) {
      onValuesChange?.([], []);
    } else {
      onChange?.("", undefined);
    }
    // Keep the dropdown open and re-focus so user can pick a new option immediately
    setIsOpen(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      isClearingRef.current = false;
    });
  };

  const handleToggleMultiSelect = React.useCallback(
    (optionValue: string) => {
      if (!multiSelect) return;

      const nextValues = selectedSet.has(optionValue)
        ? selectedValues.filter((val) => val !== optionValue)
        : [...selectedValues, optionValue];

      const nextOptions = nextValues
        .map((val) => optionByValue.get(val))
        .filter(Boolean) as TOption[];

      onValuesChange?.(nextValues, nextOptions);
    },
    [multiSelect, onValuesChange, optionByValue, selectedSet, selectedValues],
  );

  const handleToggleSelectAll = React.useCallback(() => {
    if (!multiSelect) return;

    if (allSelected) {
      const visibleSet = new Set(selectableValues);
      const nextValues = selectedValues.filter((val) => !visibleSet.has(val));
      const nextOptions = nextValues
        .map((val) => optionByValue.get(val))
        .filter(Boolean) as TOption[];
      onValuesChange?.(nextValues, nextOptions);
      return;
    }

    const nextValueSet = new Set([...selectedValues, ...selectableValues]);
    const nextValues = Array.from(nextValueSet);
    const nextOptions = nextValues
      .map((val) => optionByValue.get(val))
      .filter(Boolean) as TOption[];
    onValuesChange?.(nextValues, nextOptions);
  }, [
    allSelected,
    multiSelect,
    onValuesChange,
    optionByValue,
    selectableValues,
    selectedValues,
  ]);

  const handleRemoveSelected = React.useCallback(
    (optionValue: string) => {
      if (!multiSelect) return;
      const nextValues = selectedValues.filter((val) => val !== optionValue);
      const nextOptions = nextValues
        .map((val) => optionByValue.get(val))
        .filter(Boolean) as TOption[];
      onValuesChange?.(nextValues, nextOptions);
    },
    [multiSelect, onValuesChange, optionByValue, selectedValues],
  );

  const itemPadding =
    size === "sm"
      ? "px-2 py-1 text-xs leading-4 rounded-sm"
      : "px-3 py-2 text-sm leading-5 rounded-md";
  const inputSize =
    size === "sm" ? "h-9 text-sm px-3 pr-8" : "h-10 text-sm px-3 pr-9";

  const ariaInvalid = !!errorText;
  const describedById = errorText
    ? `${fieldId}-error`
    : helperText
      ? `${fieldId}-help`
      : undefined;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label} {required && <span className="text-destructive">*</span>}
          {labelHint && (
            <span className="ml-1 text-xs text-grey-600">{labelHint}</span>
          )}
        </label>
      )}

      <Command
        shouldFilter={false}
        onKeyDown={onKeyDown}
        className={cn("overflow-visible", className)}
      >
        {/* Input wrapper */}
        <div
          onClick={() => {
            open();
            inputRef.current?.focus();
          }}
          className={cn(
            "relative w-full rounded-md border-[var(--dgem-light-blue)] bg-white ring-offset-white text-sm focus-within:ring-2 focus-within:ring-[#0058AB] focus-within:ring-offset-2 cursor-pointer rounded-[8px]",
            multiSelect
              ? "flex h-9 items-center px-2 pr-8"
              : "flex items-center justify-between",
          )}
        >
          {multiSelect ? (
            <div
              ref={multiSelectContainerRef}
              className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden"
            >
              {visibleSelectedOptions.map((opt) => {
                const optionValue = getOptionValue(opt);
                const optionLabel = getOptionLabel(opt);

                return (
                  <span
                    key={optionValue}
                    className="inline-flex max-w-full items-center gap-1 rounded-md border bg-white px-2 py-1 text-xs"
                  >
                    <span className="max-w-28 truncate sm:max-w-36">
                      {optionLabel}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${optionLabel}`}
                      className="text-grey-600 hover:text-foreground"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleRemoveSelected(optionValue)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}

              <TooltipProvider delayDuration={150}>
                {hiddenSelectedCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center rounded-md border bg-muted px-2 py-1 text-xs text-grey-600">
                        +{hiddenSelectedCount}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-64 text-left whitespace-normal wrap-break-word">
                      {hiddenSelectedLabels.join(", ")}
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>

              <input
                id={fieldId}
                ref={inputRef as React.Ref<HTMLInputElement>}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onBlur={close}
                onFocus={open}
                onClick={open}
                placeholder={placeholder}
                aria-invalid={ariaInvalid || undefined}
                aria-describedby={describedById}
                className="h-7 min-w-16 flex-1 bg-transparent px-1 text-sm rounded-md outline-none cursor-pointer"
              />
            </div>
          ) : (
            <input
              id={fieldId}
              ref={inputRef as React.Ref<HTMLInputElement>}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onBlur={close}
              onFocus={open}
              onClick={open}
              placeholder={placeholder}
              aria-invalid={ariaInvalid || undefined}
              aria-describedby={describedById}
              className={cn(
                "w-full rounded-md outline-none cursor-pointer",
                inputSize,
              )}
            />
          )}

          {/* End icon: Clear (X) or Dropdown */}
          {showClearIcon ? (
            <button
              type="button"
              aria-label="Clear"
              className="absolute inset-y-0 right-2 flex items-center text-grey-600 hover:text-foreground"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              tabIndex={-1}
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Toggle options"
              className="absolute inset-y-0 right-2 flex items-center text-grey-600 hover:text-foreground"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggle}
              tabIndex={-1}
            >
              <ChevronsUpDown className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="relative h-0">
            {/* Absolute panel – must be OUTSIDE CommandList to avoid overflow clipping */}
            <div className="absolute left-0 top-0 mt-1 z-50 w-full">
              <CommandGroup
                className="relative z-50 min-w-32 rounded-md border border-grey-200 bg-white shadow-md overflow-y-auto"
                style={{ maxHeight: maxListHeight }}
              >
                <>
                  {multiSelect && enableSelectAll && items.length > 0 && (
                    <CommandItem
                      value={selectAllLabel}
                      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                      onSelect={() => {
                        handleToggleSelectAll();
                        requestAnimationFrame(() => inputRef.current?.focus());
                      }}
                      className={cn(
                        "flex w-full items-center cursor-pointer gap-2 overflow-hidden border-b aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                        itemPadding,
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                          allSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-grey-200 bg-white text-[#121A38]",
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </span>

                      <span className="truncate max-w-full font-medium">
                        {allSelected
                          ? `Clear ${selectAllLabel}`
                          : selectAllLabel}
                      </span>
                    </CommandItem>
                  )}

                  {items.map((opt) => {
                    const optionValue = getOptionValue(opt);
                    const optionLabel = getOptionLabel(opt);
                    const isSelected = multiSelect
                      ? selectedSet.has(optionValue)
                      : value === optionValue;

                    return (
                      <CommandItem
                        key={optionValue}
                        value={optionLabel}
                        onMouseDown={(e) => e.preventDefault()} // prevent blur
                        onSelect={() => {
                          if (multiSelect) {
                            handleToggleMultiSelect(optionValue);
                            onInputChange("");
                          } else {
                            onInputChange(optionLabel);
                            onChange?.(optionValue, opt);
                          }
                          onAfterSelectOpenDialog?.();
                          if (!multiSelect && closeOnSelect) close();
                          requestAnimationFrame(() =>
                            inputRef.current?.focus(),
                          );
                        }}
                        className={cn(
                          "flex w-full items-center cursor-pointer gap-2 overflow-hidden aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                          itemPadding,
                        )}
                      >
                        {multiSelect && (
                          <span
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-grey-200 bg-white text-[#121A38]",
                            )}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                        )}

                        <span className="truncate max-w-full">
                          {renderOption
                            ? renderOption(opt, isSelected)
                            : optionLabel}
                        </span>
                      </CommandItem>
                    );
                  })}
                </>

                {items.length === 0 && (
                  <CommandEmpty>
                    <div className="py-3 text-center text-xs text-grey-600">
                      No options
                    </div>
                  </CommandEmpty>
                )}
              </CommandGroup>
            </div>
          </div>
        )}
      </Command>

      {/* Helper / error under field */}
      {errorText ? (
        <p id={`${fieldId}-error`} className="mt-1 text-xs text-destructive">
          {errorText}
        </p>
      ) : helperText ? (
        <p id={`${fieldId}-help`} className="mt-1 text-xs text-grey-600">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
