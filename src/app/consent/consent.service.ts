import { Injectable, effect, signal } from '@angular/core';
import { inject as injectVercelAnalytics } from '@vercel/analytics';

export type ConsentChoice = 'accepted' | 'declined';

const CONSENT_KEY = 'instrumental-separator:cookie-consent';

@Injectable({ providedIn: 'root' })
export class ConsentService {
  /** `null` = utilizatorul nu s-a pronunțat încă (bannerul trebuie afișat). */
  readonly consent = signal<ConsentChoice | null>(readStoredConsent());

  constructor() {
    // Pornește Vercel Analytics doar dacă (și de îndată ce) utilizatorul acceptă —
    // atât la reveniri (consimțământ deja stocat), cât și imediat după ce apasă „Accept”.
    effect(() => {
      if (this.consent() === 'accepted' && typeof window !== 'undefined') {
        injectVercelAnalytics();
      }
    });
  }

  accept(): void {
    this.setConsent('accepted');
  }

  decline(): void {
    this.setConsent('declined');
  }

  /** Retrage alegerea curentă, ca bannerul să poată fi afișat din nou. */
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
