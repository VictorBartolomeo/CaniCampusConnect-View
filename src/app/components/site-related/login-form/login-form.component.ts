import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox'; // ✅ Import pour "Se souvenir de moi"
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../service/auth.service';
import {environment} from '../../../../environments/environment';
import {EmailValidator} from '../../../service/validators/email-validator';
import {PasswordValidator} from '../../../service/validators/password-validator';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    InputTextModule,
    RouterLink,
    NgIf,
    NgClass,
    ReactiveFormsModule,
    PasswordModule,
    CardModule,
    ButtonModule,
    CheckboxModule, // ✅ Module checkbox ajouté
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, EmailValidator.validEmail()]],
      password: ['', [Validators.required, PasswordValidator.strongPassword()]],
      rememberMe: [false]
    });

    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onConnection() {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Échec',
        detail: 'Veuillez corriger les erreurs du formulaire',
        life: 3000
      });
      return;
    }

    this.loading = true;

    const email = this.loginForm.get('email')?.value.trim();
    const password = this.loginForm.get('password')?.value;
    const rememberMe = this.loginForm.get('rememberMe')?.value;

    this.authService.login(email, password, rememberMe).subscribe({
      next: (response: any) => {
        this.loading = false;

        if (response && response.success && response.token) {
          this.authService.setToken(response.token, rememberMe);

          this.messageService.add({
            severity: 'success',
            summary: 'Connexion réussie',
            detail: 'Vous êtes maintenant connecté !',
            life: 3000
          });

          setTimeout(() => {
            this.redirectToDashboard();
          }, 1500);
        } else {
          // ✅ Gérer le cas où la réponse est null (erreur)
          this.error = "Email ou mot de passe incorrect";
          this.messageService.add({
            severity: 'error',
            summary: 'Échec de connexion',
            detail: "Email ou mot de passe incorrect",
            life: 3000
          });
        }
      },
      error: error => {
        this.loading = false;

        if (error.status === 401) {
          this.error = "Email ou mot de passe incorrect";
          this.messageService.add({
            severity: 'error',
            summary: 'Échec de connexion',
            detail: "Email ou mot de passe incorrect",
            life: 3000
          });
        } else if (error.status === 403) {
          this.error = "Compte non activé ou suspendu";
          this.messageService.add({
            severity: 'warn',
            summary: 'Compte non activé',
            detail: "Votre compte n'est pas encore activé. Vérifiez vos emails.",
            life: 5000
          });
        } else {
          this.error = "Une erreur est survenue lors de la connexion";
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Une erreur est survenue lors de la connexion",
            life: 3000
          });
        }
      }
    });
  }

  private redirectToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
