import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import {EmailValidationResponse} from '../../../service/email-validation.service';
import { EmailValidationService } from '../../../service/email-validation.service';
import { NotificationService } from '../../../service/notifications.service';

@Component({
  selector: 'app-token-validation-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    BadgeModule,
    DialogModule
  ],
  templateUrl: './token-validation-card.component.html',
  styleUrls: ['./token-validation-card.component.scss']
})
export class TokenValidationCardComponent {
  private router = inject(Router);
  private emailValidationService = inject(EmailValidationService);
  private notificationService = inject(NotificationService);

  @Input() token: string | null = null;
  @Input() email: string | null = null;
  @Input() loading: boolean = true;
  @Input() validationResult: EmailValidationResponse | null = null;
  @Input() errorMessage: string | null = null;

  // Dialog state
  resendDialogVisible: boolean = false;
  resendingValidationEmail: boolean = false;

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  requestResendEmail(): void {
    this.resendDialogVisible = true;
  }

  resendValidationEmail(): void {
    if (!this.email) {
      this.notificationService.showError(
        'Erreur',
        'Adresse email manquante. Impossible d\'envoyer un email de validation.'
      );
      this.resendDialogVisible = false;
      return;
    }

    this.resendingValidationEmail = true;

    this.emailValidationService.resendValidationEmail(this.email).subscribe({
      next: (response) => {
        this.resendingValidationEmail = false;
        this.resendDialogVisible = false;

        // Show success notification
        this.notificationService.showSuccess(
          'Succès',
          response.message || 'Un email de validation a été renvoyé avec succès.'
        );
      },
      error: (error) => {
        console.error('Error resending validation email:', error);
        this.resendingValidationEmail = false;
        this.resendDialogVisible = false;

        // Show error notification
        this.notificationService.showError(
          'Erreur',
          error.message || 'Une erreur est survenue lors de l\'envoi de l\'email de validation.'
        );
      }
    });
  }
}
