'use client';

import { useEffect } from 'react';

/**
 * Removes the Netlify floating badge that is injected into the DOM on
 * Netlify-hosted sites. The badge is rendered inside a custom element
 * (<netlify-drawer> / <netlify-floating-badge>) which CSS from the page
 * cannot reach (Shadow DOM). We use a MutationObserver so it is removed
 * as soon as it appears, regardless of when Netlify injects it.
 */
export default function HideNetlifyBadge() {
  useEffect(() => {
    const SELECTORS = [
      'netlify-floating-badge',
      'netlify-drawer',
      '#netlify-badge',
      '.netlify-badge',
      '#nl-badge',
      '.nl-badge',
    ];

    const remove = () => {
      SELECTORS.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      });
    };

    // Remove immediately in case it already exists
    remove();

    // Watch for it being injected after page load
    const observer = new MutationObserver(remove);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
