import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavigationStackContext = createContext(null);

const DEFAULT_TABS = {
  Radar: { path: "/RadarScope", search: "", scrollY: 0 },
  Contacts: { path: "/Contacts", search: "", scrollY: 0 },
  Settings: { path: "/Settings", search: "", scrollY: 0 },
};

function getTabKey(pathname) {
  if (pathname.startsWith("/Contacts")) return "Contacts";
  if (pathname.startsWith("/Settings")) return "Settings";
  return "Radar";
}

export function NavigationStackProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const routeStackRef = useRef([]);
  const [tabState, setTabState] = useState(DEFAULT_TABS);

  useEffect(() => {
    const currentRoute = `${location.pathname}${location.search}`;
    const stack = routeStackRef.current;
    const lastRoute = stack[stack.length - 1];
    const previousRoute = stack[stack.length - 2];

    if (lastRoute !== currentRoute) {
      if (previousRoute === currentRoute) {
        stack.pop();
      } else {
        stack.push(currentRoute);
      }
    }

    const tabKey = getTabKey(location.pathname);
    setTabState((current) => ({
      ...current,
      [tabKey]: {
        ...current[tabKey],
        path: location.pathname,
        search: location.search || "",
      },
    }));
  }, [location.pathname, location.search]);

  const value = useMemo(() => ({
    goBack: (fallbackPath = "/RadarScope") => {
      const stack = routeStackRef.current;
      if (stack.length > 1) {
        stack.pop();
        navigate(stack[stack.length - 1], { replace: true });
        return;
      }
      navigate(fallbackPath, { replace: true });
    },
    navigateToTab: (tabKey) => {
      const target = tabState[tabKey] || DEFAULT_TABS[tabKey];
      navigate(`${target.path}${target.search}`, { replace: false });
    },
    resetTab: (tabKey) => {
      const target = DEFAULT_TABS[tabKey];
      navigate(target.path, { replace: true });
    },
    saveScrollPosition: (tabKey, scrollY) => {
      setTabState((current) => ({
        ...current,
        [tabKey]: {
          ...(current[tabKey] || DEFAULT_TABS[tabKey]),
          scrollY,
        },
      }));
    },
    getScrollPosition: (tabKey) => tabState[tabKey]?.scrollY || 0,
  }), [navigate, tabState]);

  return (
    <NavigationStackContext.Provider value={value}>
      {children}
    </NavigationStackContext.Provider>
  );
}

export function useNavigationStack() {
  const context = useContext(NavigationStackContext);
  if (!context) {
    throw new Error("useNavigationStack must be used within NavigationStackProvider");
  }
  return context;
}