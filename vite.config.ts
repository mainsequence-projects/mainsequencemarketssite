import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const localFrameAncestors = "'self' http://localhost:* http://127.0.0.1:*";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const commandCenterOrigin = exactHttpOrigin(env.VITE_COMMAND_CENTER_ORIGIN);
  const frameAncestors = env.EMBED_FRAME_ANCESTORS?.trim()
    || (commandCenterOrigin ? `'self' ${commandCenterOrigin}` : localFrameAncestors);
  const headers = {
    "Content-Security-Policy": `frame-ancestors ${frameAncestors}; base-uri 'self'; object-src 'none'`,
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
  };

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": new URL("./src", import.meta.url).pathname },
      dedupe: ["react", "react-dom"],
    },
    server: {
      host: "127.0.0.1",
      port: 3000,
      strictPort: true,
      headers,
      proxy: {
        "/docs": {
          target: "http://127.0.0.1:3011",
          changeOrigin: true,
          ws: true,
        },
      },
    },
    preview: {
      host: "127.0.0.1",
      port: 3100,
      strictPort: true,
      headers,
      proxy: {},
    },
  };
});

function exactHttpOrigin(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (value === "*") throw new Error("VITE_COMMAND_CENTER_ORIGIN cannot be '*'.");
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error("VITE_COMMAND_CENTER_ORIGIN must use HTTP or HTTPS.");
  }
  if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("VITE_COMMAND_CENTER_ORIGIN must be an exact origin without credentials or paths.");
  }
  return parsed.origin;
}
