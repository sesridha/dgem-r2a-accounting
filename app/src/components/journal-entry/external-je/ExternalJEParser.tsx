import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Play, Bot, Eye, Download, ChevronDown } from "lucide-react";
import JournalEntryTopNav from "../JournalEntryTopNav";
import {
  AIAgentWorkflowLoader,
  type WorkflowConfig,
  type WorkflowStep,
} from "@/components/shared/AIAgentWorkflowLoader";
import type { ExternalJEData, EmailParserConfig } from "./types";
import {
  EmailPreparationTable,
  EmailAttachmentsInputTable,
  EmailBusinessRulesTable,
  EmailPostingTable,
} from "./components";

// ---------- Workflow Config (shared by all parser variants) ----------

const EMAIL_AGENT_WORKFLOW_CONFIG: WorkflowConfig = {
  steps: [
    "initializing",
    "validating",
    "processing",
    "analyzing",
    "finalizing",
  ],
  messages: {
    initializing: {
      title: "Initializing Email Agent",
      detail:
        "Preparing the email parsing workflow and loading business rules.",
      rotatingMessages: [
        "Opening the orchestration session for email JE processing.",
        "Loading SOP rules and validation configuration.",
        "Warming up the email agent execution context.",
      ],
    },
    validating: {
      title: "Validating journal entries",
      detail:
        "Checking company code, document type, and GL account restrictions.",
      rotatingMessages: [
        "Verifying company code is 1000 for all lines.",
        "Checking document type is SA.",
        "Validating GL account series (no 1000/3000).",
      ],
    },
    processing: {
      title: "Processing business rules",
      detail:
        "Applying validation, calculation, and posting logic to all line items.",
      rotatingMessages: [
        "Evaluating cost center requirements for expense lines (6100 series).",
        "Checking debit/credit balance across all references.",
        "Calculating monthly amounts (Annual ÷ 12).",
        "Resolving posting combinations and account mappings.",
      ],
    },
    analyzing: {
      title: "Analyzing posting records",
      detail: "Reviewing generated output and verifying DR = CR balance.",
      rotatingMessages: [
        "Inspecting the validation results.",
        "Confirming all rules passed successfully.",
        "Preparing posting records for output.",
      ],
    },
    finalizing: {
      title: "Finalizing results",
      detail: "Composing the final posting data and completing the workflow.",
      rotatingMessages: [
        "Writing posting records to email_je_posting.",
        "Generating audit trail and rule application log.",
        "Wrapping up the email agent run.",
      ],
    },
  },
};

// ---------- Step Definitions ----------

type Step = 1 | 2 | 3;

const STEPS_2_3_META: Record<
  2 | 3,
  { title: string; description: string; breadcrumbLabel: string }
> = {
  2: {
    title: "Input Data & Business Rules",
    description:
      "Download SOP, review input data, and validate business rules before running the agent.",
    breadcrumbLabel: "Validation Data",
  },
  3: {
    title: "Ad-hoc JE Posting Results",
    description:
      "Final posted journal entries after agent validation and calculation.",
    breadcrumbLabel: "Posting Results",
  },
};

// ---------- Props ----------

interface ExternalJEParserProps {
  config: EmailParserConfig;
  onBack: () => void;
}

// ---------- Component ----------

export default function ExternalJEParser({
  config,
  onBack,
}: ExternalJEParserProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timerIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear all pending timers when the component unmounts to prevent
  // setState calls on an unmounted component.
  useEffect(() => {
    const ids = timerIdsRef.current; // ✅ capture once when effect runs

    return () => {
      ids.forEach(clearTimeout); // ✅ use stable reference
    };
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentStep]);

  const [emailContent, setEmailContent] = useState("");
  const [emailLoading, setEmailLoading] = useState(true);
  const [jeData, setJeData] = useState<ExternalJEData | null>(null);

  const [isParserLoading, setIsParserLoading] = useState(false);

  const [showAgentLoader, setShowAgentLoader] = useState(false);
  const [agentStep, setAgentStep] = useState<WorkflowStep>("initializing");
  const [agentError, setAgentError] = useState<string | null>(null);

  useEffect(() => {
    fetch(config.emailFilePath)
      .then((res) => res.text())
      .then((text) => {
        setEmailContent(text);
        setEmailLoading(false);
      })
      .catch(() => setEmailLoading(false));
  }, [config.emailFilePath]);

  // ---------- Handlers ----------

  const handleRunParser = useCallback(() => {
    setIsParserLoading(true);
    const id = setTimeout(() => {
      fetch("/data/externalJE.json")
        .then((res) => res.json())
        .then((jsonData: ExternalJEData) => {
          setJeData(jsonData);
          setIsParserLoading(false);
          setCurrentStep(2);
        })
        .catch(() => setIsParserLoading(false));
    }, 1000);
    timerIdsRef.current.push(id);
  }, []);

  const handleRunAgent = useCallback(() => {
    setShowAgentLoader(true);
    setAgentError(null);
    setAgentStep("initializing");

    const steps: { step: WorkflowStep; delay: number }[] = [
      { step: "validating", delay: 3000 },
      { step: "processing", delay: 6000 },
      { step: "analyzing", delay: 10000 },
      { step: "finalizing", delay: 13000 },
    ];
    steps.forEach(({ step, delay }) => {
      const id = setTimeout(() => setAgentStep(step), delay);
      timerIdsRef.current.push(id);
    });

    // Complete: switch to result view after the simulated agent run
    const completionId = setTimeout(() => {
      setShowAgentLoader(false);
      setCurrentStep(3);
    }, 16000);
    timerIdsRef.current.push(completionId);
  }, []);

  const handleAgentClose = () => {
    setShowAgentLoader(false);
    setAgentError(null);
  };

  // ---------- Breadcrumb ----------

  const breadcrumbItems = useMemo(() => {
    const base = [
      { label: "Home", href: "/" },
      { label: "Journal Entry", href: "/journal-entry" },
      { label: "AD-HOC JEs", onClick: onBack },
    ];
    const parserItem = {
      label: config.label,
      onClick: () => setCurrentStep(1),
    };

    if (currentStep === 1) return [...base, { label: config.label }];
    if (currentStep === 2)
      return [
        ...base,
        parserItem,
        { label: STEPS_2_3_META[2].breadcrumbLabel },
      ];

    return [
      ...base,
      parserItem,
      {
        label: STEPS_2_3_META[2].breadcrumbLabel,
        onClick: () => setCurrentStep(2),
      },
      { label: STEPS_2_3_META[3].breadcrumbLabel },
    ];
  }, [currentStep, config.label, onBack]);

  // ---------- Step Content Renderers ----------

  const renderStep1 = () => {
    const attachmentLabel =
      config.attachmentLabel ??
      config.attachmentFilePath?.split("/").pop() ??
      "attachment";

    return (
      <>
        {config.attachmentFilePath && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="bg-secondary px-4 py-2 border-b border-border text-sm font-medium text-foreground">
              📎 Email Attachment
            </div>
            <div className="px-4 py-4 flex items-center gap-3">
              <Download className="w-4 h-4 text-primary shrink-0" />
              <a
                href={config.attachmentFilePath}
                download={attachmentLabel}
                className="text-sm text-primary hover:underline font-medium"
              >
                {attachmentLabel}
              </a>
              <span className="text-xs text-muted-foreground">
                — Click to download the attachment
              </span>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="bg-secondary px-4 py-2 border-b border-border text-sm font-medium text-foreground">
            📧 Email Template
          </div>
          {emailLoading ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">
              Loading email...
            </div>
          ) : (
            <pre className="px-4 py-4 text-sm whitespace-pre-wrap text-foreground overflow-x-auto">
              {emailContent}
            </pre>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleRunParser}
            disabled={isParserLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium rounded-lg shadow transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isParserLoading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Parsing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {config.id === "attachment"
                  ? "Run Email Attachment Agent"
                  : "Run Email Content Agent"}
              </>
            )}
          </button>
        </div>
      </>
    );
  };

  const renderStep2 = () => (
    <>
      {config.sopDocxPath && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="bg-secondary px-4 py-2 border-b border-border text-sm font-medium text-foreground">
            SOP Document
          </div>
          <div className="px-4 py-4 flex items-center gap-3">
            <Eye className="w-4 h-4 text-primary shrink-0" />
            <a
              href={config.sopPdfPath ?? config.sopDocxPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline font-medium"
              title="Open SOP (PDF) in a new tab"
            >
              View SOP
            </a>
            <span className="text-xs text-muted-foreground">
              Open SOP PDF in a new tab while validating input and business
              rules.
            </span>
          </div>
        </div>
      )}

      {jeData && (
        <>
          <details className="group rounded-lg border border-border bg-card overflow-hidden" open={false}>
            <summary className="cursor-pointer list-none select-none px-4 py-3 bg-secondary/60 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Input Data
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="p-3 sm:p-4">
              {config.id === "attachment" ? (
                <EmailAttachmentsInputTable
                  data={jeData.email_attachments_input_data ?? []}
                />
              ) : (
                <EmailPreparationTable data={jeData.email_je_preparation} />
              )}
            </div>
          </details>

          <details className="group rounded-lg border border-border bg-card overflow-hidden" open={false}>
            <summary className="cursor-pointer list-none select-none px-4 py-3 bg-secondary/60 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Business Rules
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="p-3 sm:p-4">
              <EmailBusinessRulesTable
                data={
                  config.id === "attachment"
                    ? jeData.email_attachments_business_rules
                    : jeData.email_business_rules
                }
              />
            </div>
          </details>
        </>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleRunAgent}
          disabled={showAgentLoader}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium rounded-lg shadow transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Bot className="w-4 h-4" />
          Run JE Agent
        </button>
      </div>
    </>
  );

  const renderStep3 = () => {
    if (!jeData) {
      return (
        <div className="flex items-center justify-center py-16 gap-3">
          <svg
            className="animate-spin w-5 h-5 text-primary"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm text-muted-foreground">
            Loading posting results…
          </span>
        </div>
      );
    }

    const postingData =
      config.id === "attachment"
        ? (jeData.email_attachments_posting ?? [])
        : (jeData.email_je_posting ?? []);

    return <EmailPostingTable data={postingData} />;
  };

  // ---------- Main Render ----------

  const meta =
    currentStep === 1
      ? { title: config.label, description: config.description }
      : STEPS_2_3_META[currentStep];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-[#1a252f] border-b border-[#dbe0e6] dark:border-slate-700 shrink-0 z-10">
        <header className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
          <JournalEntryTopNav
            title={meta.title}
            description={meta.description}
            variant={currentStep === 3 ? "success" : null}
            items={breadcrumbItems}
          />
        </header>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 lg:p-5"
      >
        <div className="w-full space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>

      <AIAgentWorkflowLoader
        isVisible={showAgentLoader}
        currentStep={agentStep}
        workflowConfig={EMAIL_AGENT_WORKFLOW_CONFIG}
        documentName="email_journal"
        errorKind={agentError}
        onRetry={handleRunAgent}
        onClose={handleAgentClose}
      />
    </div>
  );
}
