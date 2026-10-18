'use client';

import { useEffect } from 'react';

/**
 * Removes the Netlify floating badge and feedback drawer that is injected into the DOM on
 * Netlify-hosted sites. Netlify injects custom elements (<netlify-drawer>, <netlify-floating-badge>)
 * or fixed iframes. We catch and eradicate them across all selectors and mutation events.
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
      '[data-netlify-badge]',
      '[data-netlify-drawer]',
      'div[data-testid="netlify-floating-badge"]',
      'iframe[title*="Netlify" i]',
      'iframe[src*="netlify" i]',
    ];

    const remove = () => {
      SELECTORS.forEach((sel) => {
        try {
          document.querySelectorAll(sel).forEach((el) => el.remove());
        } catch {
          // ignore invalid query selector in edge environments
        }
      });

      // Also check any fixed floating elements containing netlify links
      document.querySelectorAll('a[href*="netlify.com"]').forEach((a) => {
        const parent = a.closest('div');
        if (parent) {
          const style = window.getComputedStyle(parent);
          if (style.position === 'fixed') {
            parent.remove();
          }
        }
      });
    };

    remove();

    const observer = new MutationObserver(remove);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}

