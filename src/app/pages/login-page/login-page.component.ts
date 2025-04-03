import { Component } from '@angular/core';
import {LoginFormComponent} from '../../components/login-form/login-form.component';
import {LandingNavbarComponent} from '../../components/landing-navbar/landing-navbar.component';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-login-page',
  imports: [
    LoginFormComponent,
    LandingNavbarComponent,
    NgOptimizedImage
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

}
