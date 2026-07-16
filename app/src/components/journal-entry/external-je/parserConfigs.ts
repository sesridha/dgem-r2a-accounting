import type { EmailParserConfig } from "./types";

export const PARSER_CONFIGS: EmailParserConfig[] = [
  {
    id: "body",
    label: "JE as Email Content",
    description: "Parse and process AD-HOC journal entries from email content.",
    emailFilePath: "/data/email_file.txt",
    sopDocxPath: "/data/Accrual_details_SOP.docx",
    sopPdfPath: "/data/Accrual_details_SOP.pdf",
  },
  {
    id: "attachment",
    label: "JE as Email Attachment",
    description:
      "Parse and process AD-HOC journal entries from email attachments, with a downloadable source file.",
    emailFilePath: "/data/email_attachment.txt",
    attachmentFilePath: "/data/email_attachment_parser.xlsx",
    attachmentLabel: "Accrual Details.xlsx",
    sopDocxPath: "/data/Accrual_details_SOP.docx",
    sopPdfPath: "/data/Accrual_details_SOP.pdf",
  },
];
