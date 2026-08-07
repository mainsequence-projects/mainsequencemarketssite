import { StaticSiteIframe } from "@dev-mainsequence/command-center-sdk/embed/react";
import { mainSequenceSpaceTheme, quartzLightTheme } from "@dev-mainsequence/command-center-sdk/theme";
import { useState } from "react";

export function StaticSiteIframeTestHost() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const src = new URL("/assets", window.location.origin).toString();

  return (
    <main className="e2e-static-site-host" id="main-content">
      <div className="e2e-static-site-host__controls">
        <button type="button" onClick={() => setDark((value) => !value)}>Switch host theme</button>
        <output aria-live="polite">{ready ? "Host handshake ready" : "Waiting for child"}</output>
        {error ? <p role="alert">{error}</p> : null}
      </div>
      <StaticSiteIframe
        allowedOrigin={window.location.origin}
        className="e2e-static-site-frame"
        src={src}
        themeId={dark ? mainSequenceSpaceTheme.id : quartzLightTheme.id}
        themeMode={dark ? "dark" : "light"}
        title="Markets SDK test host"
        userUid={null}
        onProtocolError={setError}
        onReady={() => setReady(true)}
      />
    </main>
  );
}
