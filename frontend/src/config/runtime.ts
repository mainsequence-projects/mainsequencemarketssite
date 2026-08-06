export const API_CONFIGURATION_MESSAGE =
  "VITE_API_BASE_URL must be the exact HTTP(S) origin of the deployed Markets API.";

export class RuntimeConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeConfigurationError";
  }
}

export type RuntimeConfiguration = {
  apiOrigin: string;
  commandCenterOrigin: string | null;
  embedded: boolean;
};

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

export function loadRuntimeConfiguration(input: {
  apiBaseUrl?: string;
  commandCenterOrigin?: string;
  embedded?: boolean;
} = {}): RuntimeConfiguration {
  const apiOrigin = exactHttpOrigin(
    input.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL,
    "VITE_API_BASE_URL",
  );
  if (!apiOrigin) throw new RuntimeConfigurationError(API_CONFIGURATION_MESSAGE);

  const embedded = input.embedded ?? (typeof window !== "undefined" && window.parent !== window);
  const commandCenterOrigin = exactHttpOrigin(
    input.commandCenterOrigin ?? import.meta.env.VITE_COMMAND_CENTER_ORIGIN,
    "VITE_COMMAND_CENTER_ORIGIN",
  );
  if (embedded && !commandCenterOrigin) {
    throw new RuntimeConfigurationError(
      "Embedded mode requires VITE_COMMAND_CENTER_ORIGIN so the parent handshake can fail closed.",
    );
  }

  return { apiOrigin, commandCenterOrigin, embedded };
}
