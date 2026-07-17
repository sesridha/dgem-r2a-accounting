import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Play, Bot, Cog } from "lucide-react";
import JournalEntryTopNav from "../JournalEntryTopNav";
import {
  AIAgentWorkflowLoader,
  type WorkflowConfig,
  type WorkflowStep,
} from "@/components/shared/AIAgentWorkflowLoader";
import type { ExternalJEData } from "./types";
import {
  SopViewer,
  EmailPreparationTable,
  EmailBusinessRulesTable,
  EmailPostingTable,
} from "./components";

// ---------- Workflow Config for Email Agent ----------
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
type Step = 1 | 2 | 3 | 4;

const STEP_META: Record<
  Step,
  { title: string; description: string; breadcrumbLabel: string }
> = {
  1: {
    title: "Email Parser",
    description:
      "Parse and process external journal entries received via email.",
    breadcrumbLabel: "Email Parser",
  },
  2: {
    title: "SOP & Preparation Data",
    description: "Review generated SOPs and email JE preparation data.",
    breadcrumbLabel: "Preparation Data",
  },
  3: {
    title: "Business Rules & Validation",
    description:
      "Review preparation data and business rules before running the agent.",
    breadcrumbLabel: "Business Rules",
  },
  4: {
    title: "Ad-hoc JE Posting Results",
    description:
      "Final posted journal entries after agent validation and calculation.",
    breadcrumbLabel: "Posting Results",
  },
};

export default function ExternalJEs() {
  // Current wizard step
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Ref for scrollable content area
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever step changes
  useEffect(() => {
    // Reset the scrollable container to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    // Also reset window/document scroll in case a parent ancestor is scrolling
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentStep]);

  // Data state
  const [emailContent, setEmailContent] = useState("");
  const [sopContent, setSopContent] = useState("");
  const [emailLoading, setEmailLoading] = useState(true);
  const [jeData, setJeData] = useState<ExternalJEData | null>(null);

  // Loading states
  const [isParserLoading, setIsParserLoading] = useState(false);
  const [isRuleEngineLoading, setIsRuleEngineLoading] = useState(false);

  // Agent workflow loader state
  const [showAgentLoader, setShowAgentLoader] = useState(false);
  const [agentStep, setAgentStep] = useState<WorkflowStep>("initializing");
  const [agentError, setAgentError] = useState<string | null>(null);

  // Load email_file.txt on mount
  useEffect(() => {
    fetch("/data/email_file.txt")
      .then((res) => res.text())
      .then((text) => {
        setEmailContent(text);
        setEmailLoading(false);
      })
      .catch(() => setEmailLoading(false));
  }, []);

  // ---------- Handlers ----------

  /** Step 1 → Step 2: Run Email Parser */
  const handleRunParser = useCallback(() => {
    setIsParserLoading(true);

    setTimeout(() => {
      Promise.all([
        fetch("/data/email_SOP.txt").then((res) => res.text()),
        fetch("/data/externalJE.json").then((res) => res.json()),
      ])
        .then(([sopText, jsonData]) => {
          setSopContent(sopText);
          setJeData(jsonData);
          setIsParserLoading(false);
          setCurrentStep(2);
        })
        .catch(() => setIsParserLoading(false));
    }, 1000);
  }, []);

  /** Step 2 → Step 3: Run Rule Engine */
  const handleRunRuleEngine = useCallback(() => {
    setIsRuleEngineLoading(true);

    // Simulate rule engine processing (1.5s)
    setTimeout(() => {
      setIsRuleEngineLoading(false);
      setCurrentStep(3);
    }, 1500);
  }, []);

  /** Step 3 → Step 4: Run Agent */
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
      setTimeout(() => setAgentStep(step), delay);
    });

    // Complete: switch to result view
    setTimeout(() => {
      setShowAgentLoader(false);
      setCurrentStep(4);
    }, 16000);
  }, []);

  const handleAgentClose = () => {
    setShowAgentLoader(false);
    setAgentError(null);
  };

  // ---------- Breadcrumb Builder ----------
  const breadcrumbItems = useMemo(() => {
    const base = [
      { label: "Home", href: "/" },
      { label: "Journal Entry", href: "/journal-entry" },
    ];

    if (currentStep === 1) {
      return [...base, { label: "External JE's" }];
    }

    // For steps 2-4, External JE's is clickable (goes back to step 1)
    const items = [
      ...base,
      { label: "External JE's", onClick: () => setCurrentStep(1) },
    ];

    if (currentStep === 2) {
      return [...items, { label: STEP_META[2].breadcrumbLabel }];
    }

    if (currentStep === 3) {
      return [
        ...items,
        {
          label: STEP_META[2].breadcrumbLabel,
          onClick: () => setCurrentStep(2),
        },
        { label: STEP_META[3].breadcrumbLabel },
      ];
    }

    // Step 4
    return [
      ...items,
      { label: STEP_META[2].breadcrumbLabel, onClick: () => setCurrentStep(2) },
      { label: STEP_META[3].breadcrumbLabel, onClick: () => setCurrentStep(3) },
      { label: STEP_META[4].breadcrumbLabel },
    ];
  }, [currentStep]);

  // ---------- Step Content Renderers ----------

  const renderStep1 = () => (
    <>
      {/* Raw Email Content */}
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

      {/* Run Email Parser Button */}
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
              Run Email Parser
            </>
          )}
        </button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* SOP Viewer */}
      <SopViewer content={sopContent} onClose={() => setCurrentStep(1)} />

      {/* Email JE Preparation Data Table */}
      {jeData && <EmailPreparationTable data={jeData.email_je_preparation} />}

      {/* Run Rule Engine Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRunRuleEngine}
          disabled={isRuleEngineLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium rounded-lg shadow transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isRuleEngineLoading ? (
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
              Running Rule Engine...
            </>
          ) : (
            <>
              <Cog className="w-4 h-4" />
              Run Rule Engine
            </>
          )}
        </button>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      {/* Email JE Preparation Data Table */}
      {jeData && <EmailPreparationTable data={jeData.email_je_preparation} />}

      {/* Business Rules Table */}
      {jeData && <EmailBusinessRulesTable data={jeData.email_business_rules} />}

      {/* Run Agent Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRunAgent}
          disabled={showAgentLoader}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium rounded-lg shadow transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Bot className="w-4 h-4" />
          Run Agent
        </button>
      </div>
    </>
  );

  const renderStep4 = () => (
    <>{jeData && <EmailPostingTable data={jeData.email_je_posting} />}</>
  );

  // ---------- Main Render ----------
  const meta = STEP_META[currentStep];

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="bg-white dark:bg-[#1a252f] border-b border-[#dbe0e6] dark:border-slate-700 shrink-0 z-10">
        <header className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
          <JournalEntryTopNav
            title={meta.title}
            description={meta.description}
            variant={currentStep === 4 ? "success" : null}
            items={breadcrumbItems}
          />
        </header>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 lg:p-5"
      >
        <div className="w-full space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
      </div>

      {/* AI Agent Workflow Loader (full-screen overlay) */}
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
