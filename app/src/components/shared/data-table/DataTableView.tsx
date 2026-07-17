"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  TableColumnMeta,
  TableFilterOperator,
  TanstackTableModel,
} from "@/hooks/useTanstackDataTableState";
import { cn } from "@/lib/utils";
import { flexRender } from "@tanstack/react-table";
import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addYears,
  subYears,
  setMonth,
  setYear,
  getDay,
  getYear,
  getMonth,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Filter,
  Search,
  X,
} from "lucide-react";
import * as React from "react";
import ExportFile from "@/components/shared/ExportFile";

type Align = "left" | "center" | "right";

type ColumnFilterOption = {
  value: TableFilterOperator;
  label: string;
};

const COLUMN_FILTER_OPTIONS: ColumnFilterOption[] = [
  { value: "contains", label: "Contains" },
  { value: "doesNotContain", label: "Does not contain" },
  { value: "equals", label: "Equals" },
  { value: "doesNotEqual", label: "Does not equal" },
  { value: "beginsWith", label: "Begins with" },
  { value: "endsWith", label: "Ends with" },
  { value: "blank", label: "Blank" },
  { value: "notBlank", label: "Not blank" },
];

function parseColumnFilterState(filterValue: unknown): {
  operator: TableFilterOperator;
  value: string;
} {
  if (
    typeof filterValue === "object" &&
    filterValue !== null &&
    "operator" in filterValue
  ) {
    const typed = filterValue as {
      operator: TableFilterOperator;
      value?: string;
    };

    return {
      operator: typed.operator,
      value: String(typed.value ?? ""),
    };
  }

  return {
    operator: "contains",
    value: String(filterValue ?? ""),
  };
}

function DebouncedColumnFilterInput({
  value,
  onValueChange,
  placeholder,
  delay = 250,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  delay?: number;
  className?: string;
}) {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (localValue !== value) onValueChange(localValue);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [delay, localValue, onValueChange, value]);

  return (
    <Input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      className={cn("h-8 text-xs", className)}
    />
  );
}

/* ------------------------------------------------------------------
   DateColumnFilter (inline)
   A reusable date calendar filter for DataTable columns.
   Supports year → month → day drill-down navigation.
------------------------------------------------------------------ */

type CalendarView = "days" | "months" | "years";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS_LIST = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function DateColumnFilter({
  value,
  onValueChange,
  label = "Filter by date",
}: {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
}) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    if (value) {
      try {
        return startOfMonth(parse(value, "yyyy-MM-dd", new Date()));
      } catch {
        return startOfMonth(new Date());
      }
    }
    return startOfMonth(new Date());
  });

  const [view, setView] = React.useState<CalendarView>("days");

  const [yearRangeStart, setYearRangeStart] = React.useState<number>(() => {
    const year = getYear(currentMonth);
    return year - (year % 12);
  });

  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    try {
      return parse(value, "yyyy-MM-dd", new Date());
    } catch {
      return null;
    }
  }, [value]);

  const days = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart);
    const paddingDays: (Date | null)[] = Array.from(
      { length: startDayOfWeek },
      () => null,
    );
    return [...paddingDays, ...allDays];
  }, [currentMonth]);

  const handleDateSelect = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    if (value === dateStr) {
      onValueChange("");
    } else {
      onValueChange(dateStr);
    }
  };

  const handlePrev = () => {
    if (view === "days") {
      setCurrentMonth((prev) => subMonths(prev, 1));
    } else if (view === "months") {
      setCurrentMonth((prev) => subYears(prev, 1));
    } else {
      setYearRangeStart((prev) => prev - 12);
    }
  };

  const handleNext = () => {
    if (view === "days") {
      setCurrentMonth((prev) => addMonths(prev, 1));
    } else if (view === "months") {
      setCurrentMonth((prev) => addYears(prev, 1));
    } else {
      setYearRangeStart((prev) => prev + 12);
    }
  };

  const handleHeaderClick = () => {
    if (view === "days") {
      setView("months");
    } else if (view === "months") {
      setView("years");
      const year = getYear(currentMonth);
      setYearRangeStart(year - (year % 12));
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(startOfMonth(setMonth(currentMonth, monthIndex)));
    setView("days");
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(startOfMonth(setYear(currentMonth, year)));
    setView("months");
  };

  const handleClear = () => {
    onValueChange("");
  };

  const headerLabel = React.useMemo(() => {
    if (view === "days") {
      return format(currentMonth, "MMMM yyyy");
    } else if (view === "months") {
      return format(currentMonth, "yyyy");
    } else {
      return `${yearRangeStart} – ${yearRangeStart + 11}`;
    }
  }, [view, currentMonth, yearRangeStart]);

  return (
    <div className="space-y-2" aria-label={label}>
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleHeaderClick}
          className={cn(
            "text-sm font-medium text-slate-800 px-2 py-0.5 rounded-md transition-colors",
            view !== "years" && "hover:bg-slate-100 cursor-pointer",
            view === "years" && "cursor-default",
          )}
          disabled={view === "years"}
        >
          {headerLabel}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* DAYS VIEW */}
      {view === "days" && (
        <>
          <div className="grid grid-cols-7 gap-0">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-[11px] font-medium text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0">
            {days.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="h-8 w-8" />;
              }
              const isSelected = selectedDate
                ? isSameDay(day, selectedDate)
                : false;
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "h-8 w-8 mx-auto rounded-md text-xs font-medium transition-colors",
                    "hover:bg-blue-50 hover:text-blue-700",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                    isSelected &&
                      "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                    !isSelected &&
                      isTodayDate &&
                      "border border-blue-300 text-blue-700",
                    !isSelected && isCurrentMonth && "text-slate-700",
                    !isSelected && !isCurrentMonth && "text-slate-400",
                  )}
                  aria-label={format(day, "MMMM d, yyyy")}
                  aria-pressed={isSelected}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* MONTHS VIEW */}
      {view === "months" && (
        <div className="grid grid-cols-3 gap-2 py-1">
          {MONTHS_LIST.map((monthName, idx) => {
            const isCurrentMonthSelected = getMonth(currentMonth) === idx;
            const isSelectedMonth =
              selectedDate &&
              getMonth(selectedDate) === idx &&
              getYear(selectedDate) === getYear(currentMonth);
            return (
              <button
                key={monthName}
                type="button"
                onClick={() => handleMonthSelect(idx)}
                className={cn(
                  "h-9 rounded-md text-sm font-medium transition-colors",
                  "hover:bg-blue-50 hover:text-blue-700",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                  isSelectedMonth &&
                    "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                  !isSelectedMonth &&
                    isCurrentMonthSelected &&
                    "border border-blue-300 text-blue-700",
                  !isSelectedMonth &&
                    !isCurrentMonthSelected &&
                    "text-slate-700",
                )}
              >
                {monthName}
              </button>
            );
          })}
        </div>
      )}

      {/* YEARS VIEW */}
      {view === "years" && (
        <div className="grid grid-cols-3 gap-2 py-1">
          {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map(
            (year) => {
              const isCurrentYear = getYear(currentMonth) === year;
              const isSelectedYear =
                selectedDate && getYear(selectedDate) === year;
              const isTodayYear = getYear(new Date()) === year;
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={cn(
                    "h-9 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-blue-50 hover:text-blue-700",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                    isSelectedYear &&
                      "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                    !isSelectedYear &&
                      isCurrentYear &&
                      "border border-blue-300 text-blue-700",
                    !isSelectedYear &&
                      isTodayYear &&
                      !isCurrentYear &&
                      "text-blue-600",
                    !isSelectedYear &&
                      !isCurrentYear &&
                      !isTodayYear &&
                      "text-slate-700",
                  )}
                >
                  {year}
                </button>
              );
            },
          )}
        </div>
      )}

      {/* Selected date display + clear */}
      {value && (
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              {selectedDate ? format(selectedDate, "MMM dd, yyyy") : value}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
            onClick={handleClear}
            aria-label="Clear date filter"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function DataTableView<T>({
  model,
  className,
  loading = false,
  pageSizeOptions = [5, 10, 20, 50],
  hoverEffect = true,
  emptyState,
  emptyMessage = "No data available",
  showPagination = true,
  getRowClassName,
  defaultVisibleFilterColumns,
  isDownload = false,
  downloadData = [],
  downloadColumns = [],
  downloadFileName = "data_export",
}: {
  model: TanstackTableModel<T>;
  className?: string;
  loading?: boolean;
  pageSizeOptions?: number[];
  hoverEffect?: boolean;
  emptyState?: React.ReactNode;
  emptyMessage?: string;
  showPagination?: boolean;
  getRowClassName?: (row: T, index: number) => string | undefined;
  defaultVisibleFilterColumns?: string[];
  isDownload?: boolean;
  downloadData?: unknown[];
  downloadColumns?: { key: string; label: string }[];
  downloadFileName?: string;
}) {
  const {
    table,
    columnLabelMap,
    rows,
    filteredRowCount,
    isEmpty,
    state: { globalFilter },
    actions,
    title,
    description,
    options: {
      enableGlobalFilter,
      enableColumnFilters,
      enableColumnVisibility,
      globalFilterPlaceholder,
      showFilteredCount,
    },
    pagination: {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
    },
  } = model;

  const getAlignmentClass = (align?: Align) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const filterMenuColumns = React.useMemo(
    () =>
      table.getAllLeafColumns().filter((column) => {
        const meta = column.columnDef.meta as TableColumnMeta | undefined;
        return column.getCanFilter() && meta?.filterable !== false;
      }),
    [table],
  );

  const [filterVisibilityMap, setFilterVisibilityMap] = React.useState<
    Record<string, boolean>
  >({});
  const hasInitializedFilterVisibility = React.useRef(false);
  const defaultFilterColumnsKey = React.useMemo(
    () =>
      defaultVisibleFilterColumns
        ? [...defaultVisibleFilterColumns].sort().join("|")
        : "__all__",
    [defaultVisibleFilterColumns],
  );
  const previousDefaultFilterColumnsKey = React.useRef(defaultFilterColumnsKey);

  React.useEffect(() => {
    const isFirstInitialization = !hasInitializedFilterVisibility.current;
    const shouldReinitializeFromProps =
      previousDefaultFilterColumnsKey.current !== defaultFilterColumnsKey;
    const shouldUsePropDefaults =
      isFirstInitialization || shouldReinitializeFromProps;
    const defaultColumnsSet = defaultVisibleFilterColumns
      ? new Set(defaultVisibleFilterColumns)
      : null;

    setFilterVisibilityMap((prev) => {
      const next: Record<string, boolean> = {};
      for (const column of filterMenuColumns) {
        if (shouldUsePropDefaults) {
          next[column.id] = defaultColumnsSet
            ? defaultColumnsSet.has(column.id)
            : true;
        } else {
          next[column.id] = prev[column.id] ?? true;
        }
      }
      return next;
    });

    hasInitializedFilterVisibility.current = true;
    previousDefaultFilterColumnsKey.current = defaultFilterColumnsKey;
  }, [defaultFilterColumnsKey, defaultVisibleFilterColumns, filterMenuColumns]);

  const showAdvancedToolbar =
    enableGlobalFilter ||
    enableColumnFilters ||
    enableColumnVisibility ||
    (showFilteredCount && (enableGlobalFilter || enableColumnFilters));

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Toolbar */}
      {showAdvancedToolbar && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center justify-between">
          {/* Left section */}
          <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-[200px]">
            {title && (
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  {title}
                </h2>
                {description && (
                  <div className="text-[12px] text-gray-400 font-normal mt-0.5">
                    {description}
                  </div>
                )}
              </div>
            )}

            {enableGlobalFilter && (
              <Input
                value={globalFilter}
                onChange={(e) => actions.setGlobalFilter(e.target.value)}
                placeholder={globalFilterPlaceholder}
                className="h-9 w-full sm:max-w-xs"
              />
            )}

            {showFilteredCount &&
              (enableGlobalFilter || enableColumnFilters) && (
                <span className="text-xs text-muted-foreground sm:self-center">
                  {filteredRowCount} of{" "}
                  {table.getPrePaginationRowModel().rows.length} rows
                </span>
              )}
          </div>

          {/* Column Actions */}
          <div className="self-end sm:self-auto flex items-center gap-2">
            {enableColumnFilters && filterMenuColumns.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Show filter on columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {filterMenuColumns.map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={filterVisibilityMap[col.id] ?? true}
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={(val) => {
                        const checked = Boolean(val);
                        setFilterVisibilityMap((prev) => ({
                          ...prev,
                          [col.id]: checked,
                        }));
                        if (!checked) col.setFilterValue("");
                      }}
                      className="capitalize"
                    >
                      {columnLabelMap[col.id] ?? col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Columns3 className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        checked={col.getIsVisible()}
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={(val) =>
                          col.toggleVisibility(Boolean(val))
                        }
                        className="capitalize"
                      >
                        {columnLabelMap[col.id] ?? col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Download Button */}
            {isDownload && downloadData && downloadColumns && (
              <ExportFile
                data={downloadData as Record<string, unknown>[]}
                fileName={downloadFileName}
                columns={downloadColumns}
                type="csv"
                title="Download"
                dropdown
              />
            )}
          </div>
        </div>
      )}

      {/* Responsive Table Wrapper */}
      <div className="rounded-lg border bg-white overflow-x-auto">
        <Table className="min-w-max">
          {/* Table header */}
          <TableHeader className="bg-slate-50 whitespace-nowrap">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | TableColumnMeta
                    | undefined;
                  const canSort = header.column.getCanSort() && !loading;
                  const canFilter =
                    enableColumnFilters &&
                    !loading &&
                    header.column.getCanFilter() &&
                    (filterVisibilityMap[header.column.id] ?? true) &&
                    meta?.filterable !== false;
                  const { operator: filterOperator, value: filterValue } =
                    parseColumnFilterState(header.column.getFilterValue());
                  const hidesInput =
                    filterOperator === "blank" || filterOperator === "notBlank";
                  const hasActiveFilter = hidesInput
                    ? true
                    : filterValue.trim() !== "";

                  const isDateFilter = meta?.filterType === "date";

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "font-semibold uppercase text-slate-600 text-xs uppercase tracking-wider",
                        meta?.width,
                        getAlignmentClass(meta?.headerAlign as Align),
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={
                              canSort
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                            className={cn(
                              "inline-flex items-center gap-1 uppercase",
                              canSort
                                ? "cursor-pointer hover:text-slate-900"
                                : "cursor-default",
                            )}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}

                            {canSort &&
                              (header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                              ))}
                          </button>

                          {canFilter && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-6 w-6 rounded-sm text-slate-500 hover:text-slate-700",
                                    hasActiveFilter &&
                                      "text-blue-600 bg-blue-50 hover:text-blue-700 hover:bg-blue-100",
                                  )}
                                  aria-label={`Filter ${String(
                                    columnLabelMap[header.column.id] ??
                                      header.column.id,
                                  )}`}
                                >
                                  <Filter className="h-3.5 w-3.5" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="start"
                                className={cn(
                                  "p-3",
                                  isDateFilter ? "w-[280px]" : "w-60",
                                )}
                              >
                                {isDateFilter ? (
                                  /* ---- Date Calendar Filter ---- */
                                  <DateColumnFilter
                                    value={filterValue}
                                    onValueChange={(dateValue: string) => {
                                      header.column.setFilterValue(
                                        dateValue
                                          ? {
                                              operator: "contains",
                                              value: dateValue,
                                            }
                                          : "",
                                      );
                                    }}
                                    label={`Filter ${String(
                                      columnLabelMap[header.column.id] ??
                                        header.column.id,
                                    )}`}
                                  />
                                ) : (
                                  /* ---- Default Text Filter ---- */
                                  <div className="space-y-2">
                                    <Select
                                      value={filterOperator}
                                      onValueChange={(nextOperator) => {
                                        const operator =
                                          nextOperator as TableFilterOperator;

                                        header.column.setFilterValue({
                                          operator,
                                          value:
                                            operator === "blank" ||
                                            operator === "notBlank"
                                              ? ""
                                              : filterValue,
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {COLUMN_FILTER_OPTIONS.map((option) => (
                                          <SelectItem
                                            key={option.value}
                                            value={option.value}
                                          >
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    {!hidesInput && (
                                      <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                        <DebouncedColumnFilterInput
                                          value={filterValue}
                                          onValueChange={(value) =>
                                            header.column.setFilterValue({
                                              operator: filterOperator,
                                              value,
                                            })
                                          }
                                          placeholder="Filter..."
                                          className="h-8 pl-8 text-xs"
                                        />
                                      </div>
                                    )}

                                    {hasActiveFilter && (
                                      <div className="flex justify-end">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 px-2 text-xs"
                                          onClick={() =>
                                            header.column.setFilterValue("")
                                          }
                                        >
                                          Clear
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          {/* Body */}
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, idx) => (
                <TableRow key={idx}>
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyState ?? emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    hoverEffect && "hover:bg-slate-50",
                    getRowClassName?.(row.original, row.index),
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | TableColumnMeta
                      | undefined;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "text-sm text-slate-700 whitespace-normal break-words",
                          getAlignmentClass(meta?.align as Align),
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && !loading && rows.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-2">
          {/* Left section */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing</span>

            <Select
              value={pageSize.toString()}
              onValueChange={(v) => actions.setPageSize(+v)}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span>
              of {totalItems} {totalItems === 1 ? "record" : "records"}
            </span>
          </div>

          {/* Right section */}
          <div className="flex items-center justify-between md:justify-end gap-4">
            <div className="text-sm text-muted-foreground">
              {startIndex}-{endIndex} of {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
