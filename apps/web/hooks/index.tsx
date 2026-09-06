import { useEffect, useRef } from "react";

export function useOutsideClick<T extends HTMLElement>(callback: () => void, isActive: boolean = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        // Do not close if the user clicked inside a Clerk modal portal
        !target.closest(".cl-rootBox") &&
        !target.closest(".cl-modalBackdrop") &&
        // Do not close if the target element was unmounted during click
        document.body.contains(target)
      ) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback, isActive]);
  return ref;
}