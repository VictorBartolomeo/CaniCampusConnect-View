import {Component} from '@angular/core';
import {Checkbox} from 'primeng/checkbox';
import {ButtonDirective, ButtonIcon, ButtonLabel} from 'primeng/button';
import {Ripple} from 'primeng/ripple';
import {InputText} from 'primeng/inputtext';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-login-form',
  imports: [
    Checkbox,
    ButtonDirective,
    Ripple,
    InputText,
    ButtonLabel,
    ButtonIcon,
    RouterLink
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {



}
