import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {NgClass} from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from 'primeng/checkbox'; // ✅ Import pour "Se souvenir de moi"
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../../service/auth.service';
import {NotificationService} from '../../../service/notifications.service';
import {EmailValidator} from '../../../service/validators/email-validator';
import {PasswordValidator} from '../../../service/validators/password-validator';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    InputTextModule,
    RouterLink,
    NgClass,
    ReactiveFormsModule,
    PasswordModule,
    CardModule,
    ButtonModule,
    CheckboxModule
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent implements OnInit {
  // 🚀 Injection moderne avec inject()
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  ngOnInit() {
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
      this.notificationService.showError(
        'Échec',
        'Veuillez corriger les erreurs du formulaire'
      );
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

          this.notificationService.showSuccess(
            'Connexion réussie',
            'Vous êtes maintenant connecté !'
          );

          setTimeout(() => {
            this.redirectToDashboard();
          }, 1500);
        } else {
          // ✅ Gérer le cas où la réponse est null (erreur)
          this.error = "Email ou mot de passe incorrect";
          this.notificationService.showError(
            'Échec de connexion',
            "Email ou mot de passe incorrect"
          );
        }
      },
      error: error => {
        this.loading = false;

        if (error.status === 401) {
          this.error = "Email ou mot de passe incorrect";
          this.notificationService.showError(
            'Échec de connexion',
            "Email ou mot de passe incorrect"
          );
        } else if (error.status === 403) {
          this.error = "Compte non activé ou suspendu";
          this.notificationService.showWarning(
            'Compte non activé',
            "Votre compte n'est pas encore activé. Vérifiez vos emails."
          );
        } else {
          this.error = "Une erreur est survenue lors de la connexion";
          this.notificationService.showError(
            'Erreur',
            "Une erreur est survenue lors de la connexion"
          );
        }
      }
    });
  }

  private redirectToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
