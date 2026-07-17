import React, { useEffect, useMemo, useRef, useState } from "react";
import { Brain, AlertCircle, RotateCcw, Sparkles, Clock3 } from "lucide-react";

export type WorkflowStep =
  | "initializing"
  | "validating"
  | "processing"
  | "analyzing"
  | "finalizing";

export interface WorkflowConfig {
  steps: WorkflowStep[];
  messages: Record<
    WorkflowStep,
    {
      title: string;
      detail: string;
      rotatingMessages: string[];
    }
  >;
  errorMessages?: Record<string, { title: string; message: string }>;
}

export interface AIAgentWorkflowLoaderProps {
  isVisible: boolean;
  currentStep: WorkflowStep;
  workflowConfig: WorkflowConfig;
  documentName?: string;
  errorKind?: string | null;
  /** Optional dynamic message to display below the error title (e.g. details from the response). */
  errorDetail?: string | null;
  onRetry: () => void;
  onClose: () => void;
}

const DEFAULT_ERROR_MESSAGES: Record<
  string,
  { title: string; message: string }
> = {
  timeout: {
    title: "Agent Response Timeout",
    message:
      "The AI Agent is taking longer than usual to process your request. This typically happens when handling large datasets or during heavy server load. Try again in a moment, or contact support if this persists.",
  },
  cancelled: {
    title: "Process Cancelled",
    message:
      "Your request was cancelled before completion. No worries! Your data is safe. Feel free to review your inputs and try running the operation again.",
  },
  network: {
    title: "Connection Issue",
    message:
      "We're having trouble reaching the AI Agent. Please check your internet connection and VPN status, then give it another shot. If the problem continues, we're here to help!",
  },
  unknown: {
    title: "Agent Busy",
    message:
      "The AI Agent encountered an unexpected issue while processing. No data was lost. Please try again, or if this keeps happening, our support team can investigate further.",
  },
  workflow_failed: {
    title: "Workflow Did Not Complete Successfully",
    message:
      "The AI Agent completed processing but the workflow reported a failure. Please review the input data and business rules, then try again.",
  },
};

export const AIAgentWorkflowLoader: React.FC<AIAgentWorkflowLoaderProps> = ({
  isVisible,
  currentStep,
  workflowConfig,
  documentName,
  errorKind,
  errorDetail,
  onRetry,
  onClose,
}) => {
  const [displayedDots, setDisplayedDots] = useState(".");
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(0);

  const errorMessages = {
    ...DEFAULT_ERROR_MESSAGES,
    ...workflowConfig.errorMessages,
  };

  // Animate loading dots
  useEffect(() => {
    if (!isVisible || errorKind) return;

    const interval = setInterval(() => {
      setDisplayedDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible, errorKind]);

  // Track elapsed time
  useEffect(() => {
    if (!isVisible || errorKind) return;
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, errorKind]);

  const errorInfo = errorKind ? errorMessages[errorKind] : null;
  const stepMessage = workflowConfig.messages[currentStep];
  const currentStepIndex = workflowConfig.steps.indexOf(currentStep);
  const rotatingMessageIndex = Math.floor(elapsedTime / 6);

  const activeRotatingMessage = useMemo(() => {
    const messages = stepMessage.rotatingMessages;
    return messages[rotatingMessageIndex % messages.length];
  }, [rotatingMessageIndex, stepMessage]);

  const formattedElapsedTime = useMemo(() => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [elapsedTime]);

  const expectationMessage = useMemo(() => {
    if (elapsedTime < 45) {
      return "The agent has started. Initial checks and orchestration are in progress.";
    }

    if (elapsedTime < 120) {
      return "The run is active. Rule evaluation may take time depending on document volume.";
    }

    if (elapsedTime < 240) {
      return "Still within the expected range for larger rule sets. Results are being assembled.";
    }

    return "This run is taking longer than average, but the workflow is still active. Keeping this window open is recommended.";
  }, [elapsedTime]);

  // Use errorDetail if provided, otherwise fall back to the static message
  const displayMessage = errorDetail || errorInfo?.message;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-[1vw]">
      {/* Card wrapper — purely viewport-relative, no scroll */}
      <div className="relative z-10 wf-card">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl wf-card-inner backdrop-blur-xl">
          {/* Header with AI icon */}
          <div className="flex flex-col items-center wf-header-mb">
            <div className="relative wf-icon-mb">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-full blur opacity-75 animate-pulse" />
              <div className="relative bg-slate-800 rounded-full wf-icon-pad">
                <Brain className="wf-icon text-blue-400" />
              </div>
            </div>
            <h2 className="wf-title font-bold text-white text-center">
              AI Agent Processing
            </h2>
          </div>

          {/* Content based on state */}
          {!errorInfo ? (
            <>
              {/* Processing state */}
              <div className="flex flex-col items-center wf-content-gap">
                {/* Animated loader */}
                <div className="flex items-center justify-center wf-dot-gap">
                  <div
                    className="wf-dot bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  />
                  <div
                    className="wf-dot bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="wf-dot bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>

                {/* Step message */}
                <div className="text-center wf-step-gap">
                  <p className="wf-text-lg text-white font-semibold">
                    {stepMessage.title}
                    <span className="inline-block w-6 text-left">
                      {displayedDots}
                    </span>
                  </p>
                  <p className="wf-text-base text-slate-300">
                    {stepMessage.detail}
                  </p>
                  {documentName ? (
                    <p className="wf-text-sm uppercase tracking-[0.2em] text-slate-400">
                      {documentName}
                    </p>
                  ) : null}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-700 rounded-full wf-progress-h overflow-hidden">
                  <div
                    className="bg-linear-to-r from-blue-500 to-purple-500 h-full rounded-full animate-pulse"
                    style={{
                      animation: "progress 2s ease-in-out infinite",
                    }}
                  />
                </div>

                <div className="grid w-full wf-grid-gap md:grid-cols-[1.3fr_0.9fr]">
                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 wf-panel-pad text-left">
                    <div className="flex items-center gap-[0.4vw] text-slate-200 wf-label-mb">
                      <Sparkles className="wf-sm-icon text-blue-400" />
                      <span className="wf-text-sm font-semibold">
                        Live workflow update
                      </span>
                    </div>
                    <p className="wf-text-base text-slate-300">
                      {activeRotatingMessage}
                    </p>
                    <p className="wf-text-sm text-slate-400 wf-sub-mt">
                      {expectationMessage}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 wf-panel-pad">
                    <div className="flex items-center gap-[0.4vw] text-slate-200 wf-label-mb">
                      <Clock3 className="wf-sm-icon text-purple-400" />
                      <span className="wf-text-sm font-semibold">
                        Run status
                      </span>
                    </div>
                    <p className="wf-text-xl font-bold text-white">
                      {formattedElapsedTime}
                    </p>
                    <p className="wf-text-sm text-slate-400">elapsed time</p>
                    <p className="wf-text-sm text-slate-400 wf-sub-mt">
                      Typical runs: 4-5 min depending on data volume.
                    </p>
                  </div>
                </div>

                <div className="w-full rounded-lg border border-slate-700 bg-slate-900/50 wf-panel-pad">
                  <p className="wf-text-sm font-semibold text-slate-200 wf-label-mb">
                    Workflow stages
                  </p>
                  <div className="grid wf-stage-gap grid-cols-5">
                    {workflowConfig.steps.map((step, index) => {
                      const statusLabel =
                        index < currentStepIndex
                          ? "Completed"
                          : index === currentStepIndex
                            ? "Active"
                            : "Queued";

                      const statusClassName =
                        index < currentStepIndex
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : index === currentStepIndex
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-200"
                            : "border-slate-700 bg-slate-800/60 text-slate-400";

                      return (
                        <div
                          key={step}
                          className={`rounded-md border wf-stage-pad transition-colors ${statusClassName}`}
                        >
                          <p className="wf-text-xs uppercase tracking-[0.15em]">
                            {statusLabel}
                          </p>
                          <p className="wf-text-sm font-medium leading-tight wf-sub-mt">
                            {workflowConfig.messages[step].title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer hint */}
              <p className="text-center wf-text-sm text-slate-400 wf-footer-mt">
                Please don't close this window while processing...
              </p>
            </>
          ) : (
            <>
              {/* Error state */}
              <div className="flex flex-col items-center wf-content-gap animate-fadeIn">
                <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-full wf-err-icon-pad animate-pulse">
                  <AlertCircle className="wf-icon text-red-400" />
                </div>

                <div className="text-center">
                  <h3 className="wf-text-lg font-bold text-white wf-label-mb animate-slideDown">
                    {errorInfo.title}
                  </h3>
                  <p
                    className="wf-text-base text-slate-300 leading-relaxed animate-slideDown"
                    style={{ animationDelay: "0.1s" }}
                  >
                    {displayMessage}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex wf-grid-gap w-full wf-footer-mt">
                  <button
                    onClick={onClose}
                    className="flex-1 wf-btn-pad bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 wf-text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onRetry}
                    className="flex-1 wf-btn-pad bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-[0.5vw] shadow-lg hover:shadow-xl wf-text-base"
                  >
                    <RotateCcw className="wf-sm-icon" />
                    Try Again
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/*
        All sizes use vw so the entire card scales with the viewport:
        - Zoom IN  → viewport shrinks in CSS px → card + text shrink → always fits, no scroll
        - Zoom OUT → viewport grows in CSS px  → card + text grow  → stays readable
      */}
      <style>{`
        .wf-card {
          width: 50vw;
          max-width: 90vw;
        }
        .wf-card-inner {
          padding: 2vw;
        }

        /* Typography — pure vw, scales in both directions */
        .wf-title    { font-size: 1.6vw; }
        .wf-text-xl  { font-size: 2vw; }
        .wf-text-lg  { font-size: 1.2vw; }
        .wf-text-base{ font-size: 1vw; }
        .wf-text-sm  { font-size: 0.85vw; }
        .wf-text-xs  { font-size: 0.72vw; }

        /* Icons — vw-based */
        .wf-icon    { width: 2.2vw; height: 2.2vw; }
        .wf-sm-icon { width: 1.1vw; height: 1.1vw; }

        /* Dots */
        .wf-dot     { width: 0.8vw; height: 0.8vw; }
        .wf-dot-gap { gap: 0.35vw; }

        /* Spacing */
        .wf-header-mb   { margin-bottom: 1.2vw; }
        .wf-icon-mb     { margin-bottom: 0.6vw; }
        .wf-icon-pad    { padding: 1vw; }
        .wf-content-gap { gap: 1vw; }
        .wf-step-gap    { display: flex; flex-direction: column; gap: 0.3vw; }
        .wf-grid-gap    { gap: 0.7vw; }
        .wf-stage-gap   { gap: 0.5vw; }
        .wf-panel-pad   { padding: 1vw; }
        .wf-stage-pad   { padding: 0.4vw 0.6vw; }
        .wf-label-mb    { margin-bottom: 0.3vw; }
        .wf-sub-mt      { margin-top: 0.3vw; }
        .wf-footer-mt   { margin-top: 0.8vw; }
        .wf-btn-pad     { padding: 0.7vw 1.2vw; }
        .wf-err-icon-pad{ padding: 1vw; }

        /* Progress bar */
        .wf-progress-h { height: 0.35vw; }

        @keyframes progress {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-0.5vw); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
