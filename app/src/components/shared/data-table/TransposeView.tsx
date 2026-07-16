import type { Column } from "./types";

function TransposeView<T>({
  record,
  columns,
}: {
  record: T;
  columns: Column<T>[];
}) {
  return (
    <div className="space-y-2 text-sm">
      {columns.map((col, index) => {
        const value = col.render
          ? col.render(record, index)
          : // @ts-expect-error -- col.key is a dynamic key not statically known on T
            record[col.key];

        return (
          <div
            key={col.key}
            className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-1"
          >
            <div className="text-slate-500 font-medium">{col.header}</div>
            <div className="text-slate-800">{value ?? "-"}</div>
          </div>
        );
      })}
    </div>
  );
}

export default TransposeView;
