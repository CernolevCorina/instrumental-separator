import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AppLanguage,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  persistLanguage,
} from '../i18n/language';

@Component({
  selector: 'app-language-switcher',
  imports: [],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcher {
  private readonly translate = inject(TranslateService);

  readonly languages = SUPPORTED_LANGUAGES;
  readonly labels = LANGUAGE_LABELS;
  readonly currentLang = this.translate.currentLang;

  selectLanguage(lang: AppLanguage): void {
    if (this.currentLang() === lang) return;
    this.translate.use(lang);
    persistLanguage(lang);
  }
}
