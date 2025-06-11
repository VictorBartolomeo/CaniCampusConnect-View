import { Component } from '@angular/core';
import {LandingNavbarComponent} from '../../../components/site-related/landing-navbar/landing-navbar.component';
import {ForgotPasswordFormComponent} from '../../../components/site-related/forgot-password-form/forgot-password-form.component';

@Component({
  selector: 'app-forgot-password-page',
  imports: [
    ForgotPasswordFormComponent
  ],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.scss'
})
export class ForgotPasswordPageComponent {

}
