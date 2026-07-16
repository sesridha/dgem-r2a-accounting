import { useState } from "react";
import { Mail, Paperclip } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import JournalEntryTopNav from "../JournalEntryTopNav";
import ExternalJEParser from "./ExternalJEParser";
import type { EmailParserConfig } from "./types";
import { PARSER_CONFIGS } from "./parserConfigs";

// ---------- Parser Configurations ----------

const PARSER_ICON_MAP: Record<EmailParserConfig["id"], LucideIcon> = {
  body: Mail,
  attachment: Paperclip,
};

// ---------- Component ----------

export default function ExternalJEHub() {
  // Default to email-content parser so the "AD-HOC JEs" breadcrumb lands here directly.
  const [activeConfig, setActiveConfig] = useState<EmailParserConfig | null>(
    PARSER_CONFIGS[0],
  );

  if (activeConfig) {
    return (
      <ExternalJEParser
        key={activeConfig.id}
        config={activeConfig}
        onBack={() => setActiveConfig(PARSER_CONFIGS[0])}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-[#1a252f] border-b border-[#dbe0e6] dark:border-slate-700 shrink-0 z-10">
        <header className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
          <JournalEntryTopNav
            title="AD-HOC JEs"
            description="Select a parser type to process AD-HOC journal entries received via email."
            items={[
              { label: "Home", href: "/" },
              { label: "Journal Entry", href: "/journal-entry" },
              { label: "AD-HOC JEs" },
            ]}
          />
        </header>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 lg:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {PARSER_CONFIGS.map((config) => {
            const Icon = PARSER_ICON_MAP[config.id];
            return (
              <button
                key={config.id}
                onClick={() => setActiveConfig(config)}
                className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md p-5 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {config.label}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {config.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
