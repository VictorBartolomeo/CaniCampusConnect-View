import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LandingPageComponent} from './pages/landing-page/landing-page.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'CaniCampusConnect';
}
