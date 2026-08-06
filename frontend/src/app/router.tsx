import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

import { AppShell } from "@/app/app-shell";
import { NotFoundPage } from "@/app/error-page";
import { PricingMarketDataPage } from "@/features/pricing-market-data/pricing-market-data-page";
import { ResourceDetailPage } from "@/features/resources/resource-detail-page";
import { ResourceListPage } from "@/features/resources/resource-list-page";
import { resourceDefinitions } from "@/features/resources/resource-definitions";
import { SettingsPage } from "@/features/settings/settings-page";

type LocationState = { pathname: string; search: string };
type NavigateOptions = { replace?: boolean };
type RouterContextValue = {
  location: LocationState;
  navigate: (to: string, options?: NavigateOptions) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

export function AppRouter() {
  const [location, setLocation] = useState<LocationState>(readLocation);

  useEffect(() => {
    const handlePopState = () => setLocation(readLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((to: string, options: NavigateOptions = {}) => {
    const destination = new URL(to, window.location.origin);
    if (destination.origin !== window.location.origin) {
      throw new Error("Application navigation must remain on the current origin.");
    }
    if (options.replace) window.history.replaceState(null, "", destination);
    else window.history.pushState(null, "", destination);
    setLocation(readLocation());
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);
  return (
    <RouterContext.Provider value={value}>
      <AppShell>{resolveRoute(location.pathname)}</AppShell>
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextValue {
  const value = useContext(RouterContext);
  if (!value) throw new Error("useRouter must be used inside AppRouter.");
  return value;
}

export function AppLink({
  to,
  onClick,
  children,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string; children: ReactNode }) {
  const { navigate } = useRouter();
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || props.target === "_blank"
    ) return;
    event.preventDefault();
    navigate(to);
  }
  return <a {...props} href={to} onClick={handleClick}>{children}</a>;
}

function resolveRoute(pathname: string): ReactNode {
  if (pathname === "/") return <Redirect to="/assets" />;
  if (pathname === "/pricing-market-data") return <PricingMarketDataPage />;
  if (pathname === "/settings") return <SettingsPage />;
  for (const definition of resourceDefinitions) {
    if (pathname === definition.listRoute) return <ResourceListPage definition={definition} />;
    if (definition.detailRoute && pathname.startsWith(`${definition.listRoute}/`)) {
      const encodedUid = pathname.slice(definition.listRoute.length + 1);
      if (encodedUid && !encodedUid.includes("/")) {
        return (
          <ResourceDetailPage
            key={`${definition.id}:${encodedUid}`}
            definition={definition}
            uid={decodeUid(encodedUid)}
          />
        );
      }
    }
  }
  return <NotFoundPage />;
}

function Redirect({ to }: { to: string }) {
  const { navigate } = useRouter();
  useEffect(() => navigate(to, { replace: true }), [navigate, to]);
  return null;
}

function readLocation(): LocationState {
  return { pathname: window.location.pathname, search: window.location.search };
}

function decodeUid(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
