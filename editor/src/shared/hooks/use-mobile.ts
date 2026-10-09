/*     useIsMobile() is a reusable responsive-design hook that checks whether the browser width is below 
the configured 768px breakpoint and updates automatically when the viewport changes; 
it is purely frontend UI logic and does not require any backend changes. */

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mql.addEventListener("change", onChange);
    onChange();

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
