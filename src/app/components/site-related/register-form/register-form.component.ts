import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../service/auth.service';

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
    NgIf,
    NgClass,
    ReactiveFormsModule,
    PasswordModule,
    CardModule,
    ButtonModule,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent {
  registerForm: FormGroup;
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
      this.messageService.add({
        severity: 'error',
        summary: 'Échec',
        detail: 'Veuillez corriger les erreurs du formulaire avant de continuer',
        life: 3000
      });
      return;
    }

    if (!this.registerForm.get('acceptTerms')?.value) {
      this.error = "Vous devez accepter les conditions générales d'utilisation";
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: "Vous devez accepter les conditions générales d'utilisation",
        life: 3000
      });
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
        this.messageService.add({
          severity: 'success',
          summary: 'Inscription réussie',
          detail: 'Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.',
          life: 3000
        });

        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 3000);
      },
      error: error => {
        this.loading = false;

        if (error.status === 409) {
          this.error = "Un compte avec cet email existe déjà";
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Un compte avec cet email existe déjà, un e-mail de proposition de changement de mot de passe vous a été envoyé",
            life: 3000
          });
        } else {
          this.error = "Une erreur est survenue lors de la création du compte";
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Une erreur est survenue lors de la création du compte",
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
