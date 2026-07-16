export function markdownToHtml(md: string): string {
  let html = md;

  // Remove any leftover backslash escapes from mammoth
  html = html.replace(/\\([.()[\]{}*_~`#+=|!>\-\\])/g, "$1");

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (_match, code) => {
    return `<pre class="bg-[hsl(var(--secondary))] rounded-md p-3 overflow-x-auto text-sm font-mono my-3 text-[hsl(var(--foreground))]">${code
      .trim()
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</pre>`;
  });

  // Tables
  html = html.replace(/((?:\|.*\|\n)+)/g, (tableBlock) => {
    const rows = tableBlock.trim().split("\n");
    if (rows.length < 2) return tableBlock;

    let tableHtml =
      '<table class="w-full text-sm border-collapse border border-[hsl(var(--border))] my-4">';

    rows.forEach((row, idx) => {
      if (row.match(/^\|[\s-:|]+\|$/)) return;

      const cells = row
        .split("|")
        .filter((_, i, arr) => i > 0 && i < arr.length - 1);

      const tag = idx === 0 ? "th" : "td";

      const cellStyle =
        idx === 0
          ? "bg-[hsl(var(--secondary))] font-medium text-[hsl(var(--foreground))]"
          : "text-[hsl(var(--muted-foreground))]";

      tableHtml += "<tr>";

      cells.forEach((cell) => {
        tableHtml += `<${tag} class="border border-[hsl(var(--border))] px-2 py-1 ${cellStyle}">${cell.trim()}</${tag}>`;
      });

      tableHtml += "</tr>";
    });

    tableHtml += "</table>";
    return tableHtml;
  });

  // Structural elements
  html = html.replace(
    /^---$/gm,
    '<hr class="my-4 border-[hsl(var(--border))]" />',
  );

  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-sm font-semibold mt-5 mb-4 text-[hsl(var(--foreground))]">$1</h2>',
  );

  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="text-sm font-semibold mt-5 mb-4 text-[hsl(var(--foreground))]">$1</h1>',
  );

  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote class="border-l-4 border-[hsl(var(--primary))] pl-3 py-1 my-2 bg-[hsl(var(--secondary))] text-sm rounded-r-md">$1</blockquote>',
  );

  html = html.replace(
    /^ {2}- (.+)$/gm,
    '<li class="ml-8 list-disc text-sm text-[hsl(var(--muted-foreground))]">$1</li>',
  );

  html = html.replace(
    /^- (.+)$/gm,
    '<li class="ml-4 list-disc text-sm text-[hsl(var(--muted-foreground))]">$1</li>',
  );

  // Inline formatting — bold (**text** and __text__)
  html = html.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="font-semibold text-[hsl(var(--foreground))]">$1</strong>',
  );
  html = html.replace(
    /__(.+?)__/g,
    '<strong class="font-semibold text-[hsl(var(--foreground))]">$1</strong>',
  );

  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-[hsl(var(--secondary))] px-1 py-0.5 rounded text-sm font-mono text-[hsl(var(--primary))]">$1</code>',
  );

  // Paragraphs
  html = html.replace(
    /^(?!<[a-z]|<\/|$)(.+)$/gm,
    '<p class="text-sm leading-7 my-3 text-[hsl(var(--muted-foreground))]">$1</p>',
  );

  return html;
}
