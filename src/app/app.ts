import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConsentBanner } from './consent/consent-banner/consent-banner';
import { Footer } from './footer/footer';
import { Navbar } from './navbar/navbar';

@Component({
  imports: [Navbar, RouterOutlet, Footer, ConsentBanner],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
