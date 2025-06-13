
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmailValidationService, EmailValidationResponse } from '../../../service/email-validation.service';
import { TokenValidationCardComponent } from '../../../components/site-related/token-validation-card/token-validation-card.component';

@Component({
  selector: 'app-email-validation',
  standalone: true,
  imports: [
    CommonModule,
    TokenValidationCardComponent
  ],
  templateUrl: './email-validation.component.html',
  styleUrls: ['./email-validation.component.scss']
})
export class EmailValidationComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private emailValidationService = inject(EmailValidationService);

  token: string | null = null;
  email: string | null = null;
  loading: boolean = true;
  validationResult: EmailValidationResponse | null = null;
  errorMessage: string | null = null;

  constructor() {
    // Get token and email from query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];

      if (this.token && this.email) {
        this.validateEmail();
      } else {
        this.loading = false;
        this.errorMessage = 'Paramètres manquants. Veuillez vérifier le lien de validation.';
      }
    });
  }

  validateEmail(): void {
    if (!this.token || !this.email) {
      this.loading = false;
      this.errorMessage = 'Paramètres manquants. Veuillez vérifier le lien de validation.';
      return;
    }

    this.emailValidationService.validateEmail(this.token, this.email).subscribe({
      next: (response) => {
        this.validationResult = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error during email validation:', error);
        this.loading = false;
        this.errorMessage = 'Une erreur est survenue lors de la validation de l\'email.';
      }
    });
  }
}
