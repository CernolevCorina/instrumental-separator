import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { APP_PATHS } from '../../app.routes';
import { ConsentService } from '../consent.service';

@Component({
  selector: 'app-consent-banner',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './consent-banner.html',
  styleUrl: './consent-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentBanner {
  private readonly consentService = inject(ConsentService);

  protected readonly paths = APP_PATHS;
  protected readonly consent = this.consentService.consent;

  accept(): void {
    this.consentService.accept();
  }

  decline(): void {
    this.consentService.decline();
  }
}
