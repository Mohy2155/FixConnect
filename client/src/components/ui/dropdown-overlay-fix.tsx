import { useEffect } from 'react';

// Alternative approach: Force all Radix dropdowns to render with proper z-index
export function useDropdownOverlayFix() {
  useEffect(() => {
    // Find all dropdown content elements and force maximum z-index
    const observer = new MutationObserver(() => {
      const dropdownElements = document.querySelectorAll(
        '[data-radix-select-content], [data-radix-popper-content-wrapper], [data-radix-tooltip-content]'
      );
      
      dropdownElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (htmlElement.style) {
          htmlElement.style.zIndex = '2147483647';
          htmlElement.style.position = 'fixed';
          htmlElement.style.isolation = 'isolate';
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-radix-select-content', 'data-radix-popper-content-wrapper']
    });

    return () => observer.disconnect();
  }, []);
}