import {
  ApplicationNavigationShell,
  defineNavigationApplication,
  type NavigationIntent,
} from "@dev-mainsequence/command-center-sdk/navigation";
import {
  BarChart3,
  BookOpenText,
  Building2,
  CalendarDays,
  Database,
  FolderKanban,
  Layers3,
  LineChart,
  Orbit,
  Settings2,
  Shapes,
  Signal,
  WalletCards,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { useRuntime } from "@/app/runtime-provider";
import { useRouter } from "@/app/router";

const destinationRoutes = {
  "asset-categories": "/asset-categories",
  assets: "/assets",
  indices: "/indices",
  portfolios: "/portfolios",
  "portfolio-groups": "/portfolio-groups",
  "portfolio-signals": "/portfolio-signals",
  accounts: "/accounts",
  "virtual-funds": "/virtual-funds",
  "pricing-curves": "/pricing-curves",
  "pricing-market-data": "/pricing-market-data",
  calendars: "/calendars",
  "api-diagnostics": "/settings",
} as const;

type MarketsDestinationId = keyof typeof destinationRoutes;

const destinationLabels: Record<MarketsDestinationId, string> = {
  "asset-categories": "Asset Categories",
  assets: "Master List",
  indices: "Indices",
  portfolios: "Portfolios",
  "portfolio-groups": "Portfolio Groups",
  "portfolio-signals": "Signals",
  accounts: "Accounts",
  "virtual-funds": "Virtual Funds",
  "pricing-curves": "Curves",
  "pricing-market-data": "Market Data",
  calendars: "Calendars",
  "api-diagnostics": "API Diagnostics",
};

const destinationApplicationIds: Record<MarketsDestinationId, string> = {
  "asset-categories": "assets",
  assets: "assets",
  indices: "assets",
  portfolios: "portfolios",
  "portfolio-groups": "portfolios",
  "portfolio-signals": "portfolios",
  accounts: "managed-accounts",
  "virtual-funds": "managed-accounts",
  "pricing-curves": "pricing",
  "pricing-market-data": "pricing",
  calendars: "platform",
  "api-diagnostics": "platform",
};

const assetsApplication = defineNavigationApplication({
  id: "assets",
  label: "Assets",
  description: "Asset definitions and market reference data.",
  icon: Shapes,
  defaultDestinationId: "assets",
  subApplications: [
    {
      id: "reference-data",
      label: "Reference Data",
      destinations: [
        { id: "asset-categories", label: destinationLabels["asset-categories"], icon: Shapes, order: 10 },
        { id: "assets", label: destinationLabels.assets, icon: Database, order: 20 },
        { id: "indices", label: destinationLabels.indices, icon: BarChart3, order: 30 },
      ],
    },
  ],
});

const portfoliosApplication = defineNavigationApplication({
  id: "portfolios",
  label: "Portfolios",
  description: "Portfolio definitions, groups, and signals.",
  icon: FolderKanban,
  defaultDestinationId: "portfolios",
  subApplications: [
    {
      id: "portfolio-management",
      label: "Portfolio Management",
      destinations: [
        { id: "portfolios", label: destinationLabels.portfolios, icon: FolderKanban, order: 10 },
        { id: "portfolio-groups", label: destinationLabels["portfolio-groups"], icon: Layers3, order: 20 },
        { id: "portfolio-signals", label: destinationLabels["portfolio-signals"], icon: Signal, order: 30 },
      ],
    },
  ],
});

const managedAccountsApplication = defineNavigationApplication({
  id: "managed-accounts",
  label: "Managed Accounts",
  description: "Managed accounts and virtual funds.",
  icon: Building2,
  defaultDestinationId: "accounts",
  subApplications: [
    {
      id: "account-management",
      label: "Account Management",
      destinations: [
        { id: "accounts", label: destinationLabels.accounts, icon: Building2, order: 10 },
        { id: "virtual-funds", label: destinationLabels["virtual-funds"], icon: WalletCards, order: 20 },
      ],
    },
  ],
});

const pricingApplication = defineNavigationApplication({
  id: "pricing",
  label: "Pricing",
  description: "Pricing curves and market-data configuration.",
  icon: LineChart,
  defaultDestinationId: "pricing-curves",
  subApplications: [
    {
      id: "pricing-data",
      label: "Pricing Data",
      destinations: [
        { id: "pricing-curves", label: destinationLabels["pricing-curves"], icon: LineChart, order: 10 },
        { id: "pricing-market-data", label: destinationLabels["pricing-market-data"], icon: Orbit, order: 20 },
      ],
    },
  ],
});

const platformApplication = defineNavigationApplication({
  id: "platform",
  label: "Platform",
  description: "Calendars and API diagnostics.",
  icon: Settings2,
  defaultDestinationId: "calendars",
  subApplications: [
    {
      id: "platform-tools",
      label: "Platform Tools",
      destinations: [
        { id: "calendars", label: destinationLabels.calendars, icon: CalendarDays, order: 10 },
        { id: "api-diagnostics", label: destinationLabels["api-diagnostics"], icon: Settings2, order: 20 },
      ],
    },
  ],
});

const documentationApplication = defineNavigationApplication({
  id: "documentation",
  label: "Documentation",
  description: "Main Sequence Markets surface and technical documentation.",
  icon: BookOpenText,
  defaultDestinationId: "documentation-home",
  subApplications: [
    {
      id: "documentation",
      label: "Documentation",
      destinations: [
        {
          id: "documentation-home",
          label: "Open documentation",
          icon: BookOpenText,
        },
      ],
    },
  ],
});

const navigationApplications = [
  assetsApplication,
  portfoliosApplication,
  managedAccountsApplication,
  pricingApplication,
  platformApplication,
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { location, navigate } = useRouter();
  const runtime = useRuntime();
  const activeDestinationId = findActiveDestinationId(location.pathname);
  const activeApplicationId = activeDestinationId
    ? destinationApplicationIds[activeDestinationId]
    : null;
  const currentTitle = activeDestinationId ? destinationLabels[activeDestinationId] : "Overview";
  const [navigationCollapsed, setNavigationCollapsed] = useState(false);
  const [openNavigation, setOpenNavigation] = useState<{
    applicationId: string | null;
    pathname: string;
  }>(() => ({
    applicationId: activeApplicationId ?? assetsApplication.id,
    pathname: location.pathname,
  }));
  const openApplicationId = openNavigation.pathname === location.pathname
    ? openNavigation.applicationId
    : (activeApplicationId ?? assetsApplication.id);

  function handleOpenApplicationChange(applicationId: string | null) {
    if (applicationId === documentationApplication.id) {
      window.location.assign("/docs/");
      return;
    }
    setOpenNavigation({ applicationId, pathname: location.pathname });
  }

  function handleNavigate(intent: NavigationIntent) {
    if (intent.applicationId === documentationApplication.id) {
      window.location.assign("/docs/");
      return;
    }
    const destinationId = intent.destinationId as MarketsDestinationId;
    const path = destinationRoutes[destinationId];
    if (!path || destinationApplicationIds[destinationId] !== intent.applicationId) return;
    navigate(path);
    setOpenNavigation({ applicationId: intent.applicationId, pathname: path });
  }

  if (!runtime.initialized) {
    return (
      <main className="embed-gate" role="status" aria-live="polite">
        <div className="brand-mark"><LineChart size={22} /></div>
        <p className="eyebrow">Secure embed handshake</p>
        <h1>Waiting for display context</h1>
        <p>The application is waiting for an initialize message from the configured Command Center origin.</p>
        {runtime.embedError ? <p className="inline-error" role="alert">{runtime.embedError}</p> : null}
      </main>
    );
  }

  return (
    <ApplicationNavigationShell
      activeApplicationId={activeApplicationId}
      activeDestinationId={activeDestinationId}
      applications={navigationApplications}
      ariaLabel="Main Sequence Markets applications"
      className="markets-navigation-shell"
      collapsed={navigationCollapsed}
      contentClassName="markets-navigation-content"
      footerApplications={[documentationApplication]}
      label="Main Sequence Markets"
      onCollapsedChange={setNavigationCollapsed}
      onNavigate={handleNavigate}
      onOpenApplicationChange={handleOpenApplicationChange}
      openApplicationId={openApplicationId}
    >
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="shell-column">
        <header className="topbar">
          <div className="topbar-heading">
            <div><span>Markets</span><strong>{currentTitle}</strong></div>
          </div>
        </header>
        {children}
      </div>
    </ApplicationNavigationShell>
  );
}

function findActiveDestinationId(pathname: string): MarketsDestinationId | null {
  const destination = (Object.entries(destinationRoutes) as Array<[MarketsDestinationId, string]>)
    .find(([, path]) => pathname === path || pathname.startsWith(`${path}/`));
  return destination?.[0] ?? null;
}
