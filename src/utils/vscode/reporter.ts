import TelemetryReporter from "@vscode/extension-telemetry";
import getPackageInfo from "../getPackageInfo";
import { EXTENSION_ID, TELEMETRY_INSIGHTS_KEY } from "../../constants";

const analyticsReporter = () => {
  const extensionVersion = getPackageInfo().version;

  let reporter: TelemetryReporter;
  reporter = new TelemetryReporter(
    EXTENSION_ID,
    extensionVersion,
    TELEMETRY_INSIGHTS_KEY
  );
  return reporter;
};

export default analyticsReporter;
