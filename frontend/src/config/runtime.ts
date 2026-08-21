export const API_CONFIGURATION_MESSAGE =
  "Standalone mode requires VITE_API_BASE_URL to be the exact HTTP(S) origin of the deployed Markets API.";
export const FASTAPI_RELEASE_CONFIGURATION_MESSAGE =
  "Embedded mode requires VITE_FASTAPI_RELEASE_UID to identify the deployed Markets FastAPI release.";

export class RuntimeConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeConfigurationError";
  }
}

export type RuntimeConfiguration = {
  apiOrigin: string | null;
  commandCenterOrigin: string | null;
  embedded: boolean;
  fastApiReleaseUid: string | null;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

export function exactHttpOrigin(raw: string | undefined, label: string): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (value === "*") {
    throw new RuntimeConfigurationError(`${label} must be an exact origin; '*' is not allowed.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new RuntimeConfigurationError(`${label} is not a valid URL.`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new RuntimeConfigurationError(`${label} must use HTTP or HTTPS.`);
  }
  if (parsed.username || parsed.password) {
    throw new RuntimeConfigurationError(`${label} must not contain credentials.`);
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new RuntimeConfigurationError(
      `${label} must not contain a path, query string, or fragment.`,
    );
  }
  return parsed.origin;
}

type RuntimeConfigurationInput = {
  apiBaseUrl?: string;
  commandCenterOrigin?: string;
  embedded?: boolean;
  fastApiReleaseUid?: string;
};

export function loadRuntimeConfiguration(input?: RuntimeConfigurationInput): RuntimeConfiguration {
  const source = input ?? {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    commandCenterOrigin: import.meta.env.VITE_COMMAND_CENTER_ORIGIN,
    fastApiReleaseUid: import.meta.env.VITE_FASTAPI_RELEASE_UID,
  };
  const apiOrigin = exactHttpOrigin(
    source.apiBaseUrl,
    "VITE_API_BASE_URL",
  );
  const embedded = source.embedded ?? (typeof window !== "undefined" && window.parent !== window);
  const commandCenterOrigin = exactHttpOrigin(
    source.commandCenterOrigin,
    "VITE_COMMAND_CENTER_ORIGIN",
  );
  const fastApiReleaseUid = exactUuid(
    source.fastApiReleaseUid,
    "VITE_FASTAPI_RELEASE_UID",
  );
  if (embedded && !commandCenterOrigin) {
    throw new RuntimeConfigurationError(
      "Embedded mode requires VITE_COMMAND_CENTER_ORIGIN so the parent handshake can fail closed.",
    );
  }
  if (embedded && !fastApiReleaseUid) {
    throw new RuntimeConfigurationError(FASTAPI_RELEASE_CONFIGURATION_MESSAGE);
  }
  if (!embedded && !apiOrigin) throw new RuntimeConfigurationError(API_CONFIGURATION_MESSAGE);

  return { apiOrigin, commandCenterOrigin, embedded, fastApiReleaseUid };
}

function exactUuid(raw: string | undefined, label: string): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (!UUID_PATTERN.test(value)) {
    throw new RuntimeConfigurationError(`${label} must be a UUID.`);
  }
  return value.toLowerCase();
}
