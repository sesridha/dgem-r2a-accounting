"use client";

type Props = {
  total: number;
  startIndex: number;
  endIndex: number;
  className?: string;
  emptyMessage?: string;
};

export function TableRecordInfo({
  total,
  startIndex,
  endIndex,
  className = "",
  emptyMessage = "NO DATA",
}: Props) {
  const hasData = total > 0;

  return (
    <span
      className={`ml-auto text-[11px] sm:text-xs text-slate-500 font-medium ${className}`}
    >
      {hasData
        ? `SHOWING ${startIndex}-${endIndex} OF ${total} RECORDS`
        : emptyMessage}
    </span>
  );
}
