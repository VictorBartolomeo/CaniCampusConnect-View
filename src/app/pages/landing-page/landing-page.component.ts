import {Component} from '@angular/core';
import {LandingNavbarComponent} from '../../components/landing-navbar/landing-navbar.component';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-landing-page',
  imports: [LandingNavbarComponent, Button],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
