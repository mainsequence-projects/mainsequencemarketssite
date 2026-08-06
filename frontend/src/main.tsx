import { createRoot } from "react-dom/client";

import { ApplicationBootstrap } from "@/app/application-bootstrap";
import { applyMarketsTheme } from "@/themes/theme";

import "@dev-mainsequence/command-center-sdk/theme/fonts.css";
import "@dev-mainsequence/command-center-sdk/theme/styles.css";
import "@dev-mainsequence/command-center-sdk/styles.css";
import "@/app/globals.css";

applyMarketsTheme();

const root = document.getElementById("root");
if (!root) throw new Error("Application root element was not found.");
createRoot(root).render(<ApplicationBootstrap />);
