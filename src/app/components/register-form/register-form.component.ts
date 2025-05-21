import {Component, inject, signal} from '@angular/core';
import {ButtonDirective} from 'primeng/button';
import {Card} from 'primeng/card';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {NgClass, NgIf} from '@angular/common';
import {Password} from 'primeng/password';
import {PrimeTemplate} from 'primeng/api';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-register-form',
  imports: [
    ButtonDirective,
    Card,
    FormsModule,
    InputText,
    NgIf,
    Password,
    PrimeTemplate,
    ReactiveFormsModule,
    RouterLink,
    NgClass
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent {
  formBuilder = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router)
  auth = inject(AuthService);


  registerForm = this.formBuilder.group({
    email: ['a@a.com', [Validators.required, Validators.email]],
    password: ['root', [Validators.required]],
  })

  onRegister() {
    if (this.form.valid) {
      this.http.post("http:localhost:8080/register", this.form.value).subscribe({
        next: jwt => {
          this.router.navigateByUrl('/login')
        },
        error: error => {
          if (error.status === 409) {
          }
        }
      })
    }
  }
}
