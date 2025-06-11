import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';
import { NotificationService } from '../../../service/notifications.service';

// ✅ Import des validators séparés
import { PasswordValidator } from '../../../service/validators/password-validator';
import { EmailValidator } from '../../../service/validators/email-validator';
import { PhoneValidator } from '../../../service/validators/phone-validator';
import { NameValidator } from '../../../service/validators/name-validator';
import { PasswordMatchValidator } from '../../../service/validators/password-match-validator';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    InputTextModule,
    RouterLink,
    ReactiveFormsModule,
    PasswordModule,
    CardModule,
    ButtonModule,
    CheckboxModule
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent implements OnInit {
  // 🚀 Injection moderne avec inject()
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstname: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100),
        NameValidator.validName() // ✅ Validator spécialisé pour les noms
      ]],
      lastname: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100),
        NameValidator.validName() // ✅ Validator spécialisé pour les noms
      ]],
      email: ['', [
        Validators.required,
        Validators.maxLength(150),
        EmailValidator.validEmail()
      ]],
      phone: ['', [
        Validators.maxLength(50),
        PhoneValidator.validPhone()
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        PasswordValidator.strongPassword()
      ]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validators: PasswordMatchValidator.passwordsMatch('password', 'confirmPassword')
    });

    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  get f() {
    return this.registerForm.controls;
  }

  onRegister() {
    this.submitted = true;
    this.error = '';

    if (this.registerForm.invalid) {
      this.notificationService.showError(
        'Échec',
        'Veuillez corriger les erreurs du formulaire avant de continuer'
      );
      return;
    }

    if (!this.registerForm.get('acceptTerms')?.value) {
      this.error = "Vous devez accepter les conditions générales d'utilisation";
      this.notificationService.showWarning(
        'Attention',
        "Vous devez accepter les conditions générales d'utilisation"
      );
      return;
    }

    this.loading = true;

    const registerData = {
      email: this.registerForm.get('email')?.value.trim(),
      firstname: this.registerForm.get('firstname')?.value.trim(),
      lastname: this.registerForm.get('lastname')?.value.trim(),
      phone: this.registerForm.get('phone')?.value?.trim() || null,
      password: this.registerForm.get('password')?.value
    };

    this.http.post("http://localhost:8080/owner/register", registerData).subscribe({
      next: response => {
        this.loading = false;
        this.notificationService.showSuccess(
          'Inscription réussie',
          'Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.'
        );

        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 3000);
      },
      error: error => {
        this.loading = false;

        if (error.status === 409) {
          this.error = "Un compte avec cet email existe déjà";
          this.notificationService.showError(
            'Erreur',
            "Un compte avec cet email existe déjà, un e-mail de proposition de changement de mot de passe vous a été envoyé"
          );
        } else {
          this.error = "Une erreur est survenue lors de la création du compte";
          this.notificationService.showError(
            'Erreur',
            "Une erreur est survenue lors de la création du compte"
          );
        }
      }
    });
  }

  private redirectToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
