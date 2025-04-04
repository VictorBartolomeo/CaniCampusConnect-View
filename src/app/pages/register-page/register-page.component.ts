import {Component} from '@angular/core';
import {LandingNavbarComponent} from '../../components/landing-navbar/landing-navbar.component';
import {RegisterFormComponent} from '../../components/register-form/register-form.component';

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
