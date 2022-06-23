import * as vscode from "vscode";
import TelemetryReporter from "@vscode/extension-telemetry";
import getPackageInfo from "../getPackageInfo";
import { EXTENSION_ID, TELEMETRY_INSIGHTS_KEY } from "../../constants";
/**
 * Creates the reporter to send data to azure
 */
const analyticsReporter = (): TelemetryReporter | null => {
  const extensionVersion = getPackageInfo().version;

  if (!vscode.env.isTelemetryEnabled) {
    return null;
  }
  let reporter: TelemetryReporter;
  reporter = new TelemetryReporter(
    EXTENSION_ID,
    extensionVersion,
    TELEMETRY_INSIGHTS_KEY
  );
  return reporter;
};

export default analyticsReporter;
