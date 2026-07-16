import { FileText, X, Download } from "lucide-react";
import { saveAs } from "file-saver";
import { markdownToHtml } from "../markdownToHtml";

type SopViewerProps = {
  content: string;
  onClose: () => void;
  /** When provided, the download button serves this original .docx file instead of generating a .doc from HTML */
  docxPath?: string;
};

function downloadAsDoc(content: string) {
  const html = markdownToHtml(content);

  const docContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; padding: 20px; }
        h1 { font-size: 18pt; font-weight: bold; margin-bottom: 8px; }
        h2 { font-size: 14pt; font-weight: bold; margin-top: 16px; margin-bottom: 6px; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; font-size: 10pt; }
        th { background-color: #f0f0f0; font-weight: bold; }
        li { margin: 4px 0; }
        code { font-family: 'Courier New', monospace; background: #f5f5f5; padding: 2px 4px; font-size: 10pt; }
        pre { font-family: 'Courier New', monospace; background: #f5f5f5; padding: 10px; font-size: 10pt; }
        blockquote { border-left: 3px solid #0070c0; padding-left: 10px; margin: 8px 0; color: #444; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;

  const blob = new Blob([docContent], {
    type: "application/msword;charset=utf-8",
  });
  saveAs(blob, "Email_Accrual_SOP.doc");
}

async function downloadOriginalDocx(docxPath: string) {
  const response = await fetch(docxPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch .docx file: ${response.statusText}`);
  }
  const blob = await response.blob();
  const fileName = docxPath.split("/").pop() || "Accrual_details_SOP.docx";
  saveAs(blob, fileName);
}

export function SopViewer({ content, onClose, docxPath }: SopViewerProps) {
  const handleDownload = async () => {
    if (docxPath) {
      await downloadOriginalDocx(docxPath).catch(console.error);
    } else {
      downloadAsDoc(content);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="bg-secondary px-4 py-2 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            SOP Generated (Parsed Output)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 cursor-pointer"
            title="Download original DOCX"
            aria-label="Download original DOCX"
          >
            <Download className="w-4 h-4" />
            Download SOP (DOCX)
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="px-6 py-5 max-h-125 overflow-y-auto">
        {/* Render the markdown as HTML so both txt and docx SOP input are displayed consistently. */}
        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
        {/* <pre className="whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground))]">
          {content}
        </pre> */}
      </div>
    </div>
  );
}
