import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ConsentService } from '../consent/consent.service';

@Component({
  selector: 'app-footer',
  imports: [TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  private readonly consentService = inject(ConsentService);

  protected readonly year = new Date().getFullYear();

  openCookieSettings(): void {
    this.consentService.reset();
  }
}
