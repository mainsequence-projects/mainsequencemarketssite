import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  Database,
  FolderKanban,
  Layers3,
  LineChart,
  Menu,
  Moon,
  Orbit,
  PanelLeftClose,
  Settings2,
  Shapes,
  Signal,
  Sun,
  WalletCards,
} from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";

import { useRuntime } from "@/app/runtime-provider";
import { AppLink, useRouter } from "@/app/router";

type NavigationItem = { label: string; path: string; icon: ComponentType<{ size?: number }> };
type NavigationGroup = { label: string; items: NavigationItem[] };

const navigation: NavigationGroup[] = [
  {
    label: "Assets",
    items: [
      { label: "Asset Categories", path: "/asset-categories", icon: Shapes },
      { label: "Master List", path: "/assets", icon: Database },
      { label: "Indices", path: "/indices", icon: BarChart3 },
    ],
  },
  {
    label: "Portfolios",
    items: [
      { label: "Portfolios", path: "/portfolios", icon: FolderKanban },
      { label: "Portfolio Groups", path: "/portfolio-groups", icon: Layers3 },
      { label: "Signals", path: "/portfolio-signals", icon: Signal },
    ],
  },
  {
    label: "Managed Accounts",
    items: [
      { label: "Accounts", path: "/accounts", icon: Building2 },
      { label: "Virtual Funds", path: "/virtual-funds", icon: WalletCards },
    ],
  },
  {
    label: "Pricing",
    items: [
      { label: "Curves", path: "/pricing-curves", icon: LineChart },
      { label: "Market Data", path: "/pricing-market-data", icon: Orbit },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Calendars", path: "/calendars", icon: CalendarDays },
      { label: "API Diagnostics", path: "/settings", icon: Settings2 },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { location } = useRouter();
  const runtime = useRuntime();
  const [navigationOpen, setNavigationOpen] = useState(false);

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

  if (runtime.configuration.embedded) {
    return (
      <div className="embedded-app">
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
      </div>
    );
  }

  const currentTitle = findCurrentTitle(location.pathname);
  return (
    <div className="app-shell" data-navigation-open={navigationOpen || undefined}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><LineChart size={18} /></div>
          <div><strong>MainSequence</strong><span>Markets</span></div>
          <button className="sidebar-close" type="button" onClick={() => setNavigationOpen(false)} aria-label="Close navigation">
            <PanelLeftClose size={18} />
          </button>
        </div>
        <nav className="navigation" aria-label="Markets navigation">
          {navigation.map((group) => (
            <section className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <AppLink
                    className="nav-link"
                    key={item.path}
                    to={item.path}
                    data-active={isNavigationActive(location.pathname, item.path) || undefined}
                    onClick={() => setNavigationOpen(false)}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    <ChevronRight size={13} />
                  </AppLink>
                );
              })}
            </section>
          ))}
        </nav>
        <footer className="sidebar-footer">
          <BookOpen size={15} />
          <span><strong>API contract</strong><small>128 operations · apps/v1</small></span>
        </footer>
      </aside>
      {navigationOpen ? <button className="nav-scrim" type="button" onClick={() => setNavigationOpen(false)} aria-label="Close navigation" /> : null}
      <div className="shell-column">
        <header className="topbar">
          <div className="topbar-heading">
            <button className="mobile-menu" type="button" onClick={() => setNavigationOpen(true)} aria-label="Open navigation">
              <Menu size={19} />
            </button>
            <div><span>Markets</span><strong>{currentTitle}</strong></div>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" onClick={runtime.toggleStandaloneTheme} aria-label="Toggle color theme">
              {runtime.themeMode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="session-status">
              <span className="status-dot" />
              <div>
                <strong>Standalone</strong>
                <small>Gateway session</small>
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function isNavigationActive(pathname: string, itemPath: string): boolean {
  if (itemPath === "/pricing-market-data") return pathname.startsWith(itemPath);
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

function findCurrentTitle(pathname: string): string {
  for (const group of navigation) {
    for (const item of group.items) {
      if (isNavigationActive(pathname, item.path)) return item.label;
    }
  }
  return "Overview";
}
