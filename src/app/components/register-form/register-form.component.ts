import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext'; // ✅ Module au lieu de composant
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card'; // ✅ Module
import { ButtonModule } from 'primeng/button'; // ✅ Module
import { CheckboxModule } from 'primeng/checkbox'; // ✅ Module
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast'; // ✅ Module
import { AuthService } from '../../service/auth.service';
import { PasswordValidator } from '../../service/validators/password-validator';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    InputTextModule, // ✅ Modules pour Angular 19
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

  // Pattern exactement comme votre backend
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private phonePattern = /^[0-9]{10}$/;

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
        Validators.maxLength(100)
      ]],
      lastname: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150),
        Validators.pattern(this.emailPattern)
      ]],
      phone: ['', [
        Validators.maxLength(50),
        Validators.pattern(this.phonePattern)
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
      validators: this.passwordMatchValidator
    });

    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else if (confirmPassword?.errors?.['mismatch']) {
      delete confirmPassword.errors['mismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
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
      email: this.registerForm.get('email')?.value,
      firstname: this.registerForm.get('firstname')?.value,
      lastname: this.registerForm.get('lastname')?.value,
      phone: this.registerForm.get('phone')?.value || null,
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
