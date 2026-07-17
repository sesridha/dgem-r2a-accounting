"use client";

export function EmptyState({
  message = "No data found.",
  action,
  height = "h-40",
}: {
  message?: string;
  action?: React.ReactNode;
  height?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-slate-500 ${height}`}
    >
      <p className="text-sm">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
