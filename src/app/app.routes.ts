import { Routes } from '@angular/router';
import { Separator } from './separator/separator';
import { Terms } from './terms/terms';

const TERMS_SEGMENT = 'termeni';

/** Canonical, absolute paths used for navigation (routerLink) and SEO (canonical/hreflang). */
export const APP_PATHS = {
  home: '/',
  terms: `/${TERMS_SEGMENT}`,
} as const;

export const routes: Routes = [
  { path: '', component: Separator },
  { path: TERMS_SEGMENT, component: Terms },
  { path: '**', redirectTo: '' },
];
