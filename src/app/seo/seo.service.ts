import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { SUPPORTED_LANGUAGES } from '../i18n/language';
import { SITE_URL } from './seo.config';

export interface SeoPage {
  title: string;
  description: string;
  /** Calea rutei, fără domeniu, ex: '/' sau '/termeni'. */
  path: string;
}

export interface SeoPageBinding {
  /** Cheie de traducere pentru <title> / og:title / twitter:title. */
  titleKey: string;
  /** Cheie de traducere pentru meta description / og:description / twitter:description. */
  descriptionKey: string;
  /** Calea rutei, fără domeniu, ex: '/' sau '/termeni'. */
  path: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);

  /**
   * Leagă titlul și descrierea unei pagini de cheile de traducere date, actualizându-le
   * reactiv (inclusiv <html lang>) de fiecare dată când limba activă se schimbă. Trebuie
   * apelat dintr-un context de injecție (ex. constructorul componentei de pagină).
   */
  bindPage(binding: SeoPageBinding): void {
    effect(() => {
      const lang = this.translate.currentLang() ?? 'ro';
      this.setLang(lang);
      this.set({
        title: this.translate.instant(binding.titleKey),
        description: this.translate.instant(binding.descriptionKey),
        path: binding.path,
      });
    });
  }

  private set(page: SeoPage): void {
    const canonicalUrl = `${SITE_URL}${page.path}`;

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });

    this.setCanonical(canonicalUrl);
    this.setHreflangAlternates(page.path);
  }

  private setLang(lang: string): void {
    this.doc.documentElement.lang = lang;
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setHreflangAlternates(path: string): void {
    this.doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());

    for (const lang of SUPPORTED_LANGUAGES) {
      const link = this.doc.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', `${SITE_URL}${path}`);
      this.doc.head.appendChild(link);
    }

    const defaultLink = this.doc.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', `${SITE_URL}${path}`);
    this.doc.head.appendChild(defaultLink);
  }
}
