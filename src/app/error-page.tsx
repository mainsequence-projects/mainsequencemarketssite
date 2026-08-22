import { ArrowLeft } from "lucide-react";

import { AppLink } from "@/app/router";

export function NotFoundPage() {
  return (
    <main className="fatal-page" id="main-content">
      <p className="eyebrow">404</p>
      <h1>Markets route not found</h1>
      <p>The requested product route is not part of the accepted Markets surface.</p>
      <AppLink className="button" to="/assets"><ArrowLeft size={15} /> Return to assets</AppLink>
    </main>
  );
}
