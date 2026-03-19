import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigationStack } from "@/lib/NavigationStack";

export default function useTabPageMemory(tabKey) {
  const location = useLocation();
  const { getScrollPosition, saveScrollPosition } = useNavigationStack();

  useEffect(() => {
    const savedScrollY = getScrollPosition(tabKey);
    requestAnimationFrame(() => window.scrollTo(0, savedScrollY));

    return () => {
      saveScrollPosition(tabKey, window.scrollY);
    };
  }, [getScrollPosition, saveScrollPosition, tabKey, location.pathname, location.search]);
}