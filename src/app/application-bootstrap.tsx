import { AlertTriangle } from "lucide-react";
import { StrictMode } from "react";

import { AppRouter } from "@/app/router";
import { RuntimeProvider } from "@/app/runtime-provider";
import {
  loadRuntimeConfiguration,
  RuntimeConfigurationError,
  type RuntimeConfiguration,
} from "@/config/runtime";

export function ApplicationBootstrap({ configuration }: { configuration?: RuntimeConfiguration }) {
  let resolved: RuntimeConfiguration;
  try {
    resolved = configuration ?? loadRuntimeConfiguration();
  } catch (error) {
    return <ConfigurationError error={error} />;
  }

  return (
    <StrictMode>
      <RuntimeProvider configuration={resolved}>
        <AppRouter />
      </RuntimeProvider>
    </StrictMode>
  );
}

function ConfigurationError({ error }: { error: unknown }) {
  const message = error instanceof RuntimeConfigurationError
    ? error.message
    : "The Markets application configuration could not be validated.";
  return (
    <main className="configuration-error" role="alert">
      <section>
        <AlertTriangle size={24} />
        <p className="eyebrow">Configuration required</p>
        <h1>Markets cannot start</h1>
        <p>{message}</p>
        <code>Configure VITE_API_BASE_URL and rebuild the static application.</code>
      </section>
    </main>
  );
}
