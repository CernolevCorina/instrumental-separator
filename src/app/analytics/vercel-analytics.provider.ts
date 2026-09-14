import { EnvironmentProviders, provideAppInitializer } from '@angular/core';
import { inject as injectVercelAnalytics } from '@vercel/analytics';

/**
 * Injectează scriptul Vercel Web Analytics și pornește urmărirea page view-urilor
 * (inclusiv navigările Angular Router via pushState). No-op pe server (SSR/prerender),
 * unde nu există `window`.
 */
export function provideVercelAnalytics(): EnvironmentProviders {
  return provideAppInitializer(() => {
    if (typeof window === 'undefined') return;
    injectVercelAnalytics();
  });
}
