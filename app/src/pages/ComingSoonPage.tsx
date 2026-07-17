export default function ComingSoonPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col items-center justify-center p-10 text-center sm:p-16">
      <div className="rounded-3xl border border-border bg-card p-10 shadow-lg shadow-slate-900/5">
        <span className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          In development
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Coming soon
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          This feature is still under development. Come back soon to explore the Report Preparer module.
        </p>
      </div>
    </div>
  );
}
