import {Component} from '@angular/core';
import {LandingNavbarComponent} from '../../../components/site-related/landing-navbar/landing-navbar.component';
import {RegisterFormComponent} from '../../../components/site-related/register-form/register-form.component';

@Component({
  selector: 'app-register-page',
  imports: [
    LandingNavbarComponent,
    RegisterFormComponent
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {

}
