import {Component} from '@angular/core';
import {LoginFormComponent} from '../../../components/site-related/login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  imports: [
    LoginFormComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

}
