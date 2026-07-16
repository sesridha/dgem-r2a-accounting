import { useLocation, useNavigate } from "react-router-dom";
import ExternalJEParser from "./ExternalJEParser";
import { PARSER_CONFIGS } from "./parserConfigs";
import type { EmailParserConfig } from "./types";

/**
 * Maps the URL tail segment to a parser config ID.
 * Extend this map when new parser routes are added.
 */
const SEGMENT_TO_CONFIG_ID: Record<string, EmailParserConfig["id"]> = {
  "email-body": "body",
  "email-attachment": "attachment",
};

/**
 * Route-level wrapper for ExternalJEParser.
 *
 * Reads the last URL segment to select the correct EmailParserConfig, then
 * renders ExternalJEParser with that config. The `onBack` handler navigates
 * the user back to the Email Body Parser page.
 */
export default function ExternalJEParserRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive config from the last path segment (e.g. "email-body")
  const segment = location.pathname.split("/").pop() ?? "";
  const configId = SEGMENT_TO_CONFIG_ID[segment] ?? "body";
  const config =
    PARSER_CONFIGS.find((c) => c.id === configId) ?? PARSER_CONFIGS[0];

  return (
    <ExternalJEParser
      key={config.id}
      config={config}
      onBack={() => navigate("/journal-entry/external-jes/email-body")}
    />
  );
}
