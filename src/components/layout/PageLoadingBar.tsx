"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const INTERACTION_DISPLAY_TIME = 500;
const NAVIGATION_SAFETY_TIMEOUT = 12000;

export function PageLoadingBar() {
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);

  const previousPathname = useRef(pathname);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }, []);

  const stopLoading = useCallback(
    (delay = 0) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      hideTimer.current = setTimeout(() => {
        setIsLoading(false);
        hideTimer.current = null;
      }, delay);
    },
    [],
  );

  const startLoading = useCallback(
    (waitForNavigation = false) => {
      clearTimers();

      setIsLoading(true);

      /*
       * Navigation safety fallback.
       *
       * If something prevents Next.js from completing the navigation,
       * the indicator will never remain stuck forever.
       */
      if (waitForNavigation) {
        safetyTimer.current = setTimeout(() => {
          setIsLoading(false);
          safetyTimer.current = null;
        }, NAVIGATION_SAFETY_TIMEOUT);
      }
    },
    [clearTimers],
  );

  /*
   * Initial page rendering.
   */
  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);

    return () => {
      clearTimeout(timer);
      clearTimers();
    };
  }, [clearTimers]);

  /*
   * When Next.js finishes a route transition,
   * pathname changes and we stop the indicator.
   */
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;

      if (safetyTimer.current) {
        clearTimeout(safetyTimer.current);
        safetyTimer.current = null;
      }

      /*
       * Keep the line visible for a tiny moment so that
       * extremely fast transitions are still visually noticeable.
       */
      stopLoading(120);
    }
  }, [pathname, stopLoading]);

  /*
   * GLOBAL CLICK DETECTION
   *
   * This is the important part.
   *
   * It catches interactions with:
   * - <a>
   * - <button>
   * - elements with role="button"
   * - <summary>
   * - form controls
   *
   * Therefore the indicator is not dependent only on pathname changes.
   */
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      const interactiveElement = target.closest(
        "a, button, [role='button'], summary, input, select, textarea",
      );

      if (!(interactiveElement instanceof HTMLElement)) {
        return;
      }

      /*
       * Ignore disabled controls.
       */
      if (
        interactiveElement instanceof HTMLButtonElement &&
        interactiveElement.disabled
      ) {
        return;
      }

      if (
        interactiveElement instanceof HTMLInputElement &&
        interactiveElement.disabled
      ) {
        return;
      }

      if (
        interactiveElement instanceof HTMLSelectElement &&
        interactiveElement.disabled
      ) {
        return;
      }

      /*
       * ----------------------------------------
       * LINKS / NAVIGATION
       * ----------------------------------------
       */
      if (interactiveElement.matches("a")) {
        const link = interactiveElement as HTMLAnchorElement;
        const href = link.getAttribute("href");

        if (!href) {
          return;
        }

        /*
         * Don't show for:
         * - external websites
         * - new tabs
         * - downloads
         * - mail/telephone links
         */
        if (
          link.target === "_blank" ||
          link.hasAttribute("download") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("javascript:")
        ) {
          return;
        }

        let targetUrl: URL;

        try {
          targetUrl = new URL(href, window.location.href);
        } catch {
          return;
        }

        /*
         * External navigation.
         */
        if (targetUrl.origin !== window.location.origin) {
          return;
        }

        const currentUrl = new URL(window.location.href);

        const isSamePage =
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search &&
          targetUrl.hash === currentUrl.hash;

        if (isSamePage) {
          return;
        }

        /*
         * Start and wait for pathname change.
         */
        startLoading(true);

        /*
         * Hash/section navigation doesn't change pathname,
         * so finish it manually.
         */
        const isHashNavigation =
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search &&
          targetUrl.hash !== currentUrl.hash;

        if (isHashNavigation) {
          stopLoading(450);
        }

        return;
      }

      /*
       * ----------------------------------------
       * BUTTONS / UI INTERACTIONS
       * ----------------------------------------
       *
       * For buttons we don't wait for pathname,
       * because many buttons perform local UI actions.
       */
      startLoading(false);

      stopLoading(INTERACTION_DISPLAY_TIME);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [startLoading, stopLoading]);

  /*
   * FORM SUBMISSION
   *
   * Login, signup, forgot password, practice submission,
   * etc.
   */
  useEffect(() => {
    const handleSubmit = () => {
      startLoading(true);
    };

    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, [startLoading]);

  /*
   * Browser Back / Forward.
   */
  useEffect(() => {
    const handlePopState = () => {
      startLoading(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [startLoading]);

  /*
   * Full browser refresh / leaving page.
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsLoading(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[99999] h-[2px] overflow-hidden transition-opacity duration-200 ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Base line */}
      <div className="absolute inset-0 bg-blue-500/20" />

      {/* Moving rendering indicator */}
      <div
        className="absolute top-0 h-full w-[22%] animate-[pageLoading_900ms_ease-in-out_infinite] bg-blue-500"
      />

      {/* Soft glow following the moving line */}
      <div
        className="absolute top-[-2px] h-[6px] w-[18%] animate-[pageLoadingGlow_900ms_ease-in-out_infinite] bg-blue-400/60 blur-[4px]"
      />
    </div>
  );
}