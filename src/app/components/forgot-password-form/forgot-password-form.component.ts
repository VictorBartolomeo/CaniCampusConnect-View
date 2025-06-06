
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { EmailValidator } from '../../service/validators/email-validator';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [
    InputTextModule,
    RouterLink,
    NgIf,
    NgClass,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './forgot-password-form.component.html',
  styleUrl: './forgot-password-form.component.scss'
})
export class ForgotPasswordFormComponent {
  forgotPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  success = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.maxLength(150),
        EmailValidator.validEmail()
      ]]
    });
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.success = false;

    if (this.forgotPasswordForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez saisir une adresse email valide',
        life: 3000
      });
      return;
    }

    this.loading = true;

    const email = this.forgotPasswordForm.get('email')?.value.trim();

    this.http.post("http://localhost:8080/auth/forgot-password", { email }).subscribe({
      next: response => {
        this.loading = false;
        this.success = true;

        this.messageService.add({
          severity: 'success',
          summary: 'Email envoyé',
          detail: 'Un email de récupération a été envoyé à votre adresse',
          life: 5000
        });

        // Optionnel : rediriger vers la page de connexion après 5 secondes
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 5000);
      },
      error: error => {
        this.loading = false;

        if (error.status === 404) {
          this.error = "Aucun compte associé à cette adresse email";
          this.messageService.add({
            severity: 'warn',
            summary: 'Email introuvable',
            detail: "Aucun compte n'est associé à cette adresse email",
            life: 4000
          });
        } else if (error.status === 429) {
          this.error = "Trop de tentatives. Veuillez réessayer plus tard";
          this.messageService.add({
            severity: 'warn',
            summary: 'Limite atteinte',
            detail: "Trop de tentatives. Veuillez réessayer dans quelques minutes",
            life: 4000
          });
        } else {
          this.error = "Une erreur est survenue. Veuillez réessayer";
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Une erreur est survenue lors de l'envoi de l'email",
            life: 3000
          });
        }
      }
    });
  }

  goBackToLogin() {
    this.router.navigateByUrl('/login');
  }
}
