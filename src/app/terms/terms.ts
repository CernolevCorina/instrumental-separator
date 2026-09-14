import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { APP_PATHS } from '../app.routes';
import { SeoService } from '../seo/seo.service';

@Component({
  selector: 'app-terms',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './terms.html',
  styleUrl: './terms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Terms {
  private readonly seo = inject(SeoService);

  protected readonly paths = APP_PATHS;

  constructor() {
    this.seo.bindPage({
      titleKey: 'meta.termsTitle',
      descriptionKey: 'meta.termsDescription',
      path: APP_PATHS.terms,
    });
  }
}
