import { Injectable, effect, signal } from '@angular/core';

export type ConsentChoice = 'accepted' | 'declined';

const CONSENT_KEY = 'instrumental-separator:cookie-consent';

@Injectable({ providedIn: 'root' })
export class ConsentService {
  /** `null` = the user hasn't made a choice yet (the banner must be shown). */
  readonly consent = signal<ConsentChoice | null>(readStoredConsent());

  constructor() {
    // Start Vercel Analytics only if (and as soon as) the user accepts —
    // both on return visits (consent already stored) and right after clicking "Accept".
    // Dynamic import: the script isn't needed in the initial bundle, only on demand.
    effect(() => {
      if (this.consent() === 'accepted' && typeof window !== 'undefined') {
        import('@vercel/analytics').then((m) => m.inject());
      }
    });
  }

  accept(): void {
    this.setConsent('accepted');
  }

  decline(): void {
    this.setConsent('declined');
  }

  /** Clears the current choice so the banner can be shown again. */
  reset(): void {
    this.consent.set(null);
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch {
      // localStorage poate fi indisponibil (mod privat etc.)
    }
  }

  private setConsent(choice: ConsentChoice): void {
    this.consent.set(choice);
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      // localStorage poate fi indisponibil (mod privat etc.)
    }
  }
}

function readStoredConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch {
    return null;
  }
}
