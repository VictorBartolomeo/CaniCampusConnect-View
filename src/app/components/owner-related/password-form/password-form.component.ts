
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../../service/user.service';
import { NotificationService } from '../../../service/notifications.service';
import { AuthService } from '../../../service/auth.service';
import { PasswordValidator } from '../../../service/validators/password-validator';
import { PasswordMatchValidator } from '../../../service/validators/password-match-validator';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-password-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    CardModule,
  ],
  providers: [MessageService],
  templateUrl: './password-form.component.html',
  styleUrl: './password-form.component.scss',
})
export class PasswordFormComponent implements OnInit {
  // 🚀 Injection moderne avec inject()
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private notificationsService = inject(NotificationService);
  private authService = inject(AuthService);

  passwordForm!: FormGroup;
  loading = false;

  // Regex individuelles pour chaque critère (pour l'affichage visuel)
  hasLowercaseRegex = /[a-z]/;
  hasUppercaseRegex = /[A-Z]/;
  hasDigitRegex = /\d/;
  hasSpecialCharRegex = /\W/;
  hasMinLengthRegex = /.{8,}/;

  ngOnInit() {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        PasswordValidator.strongPassword()
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: PasswordMatchValidator.passwordsMatch('newPassword', 'confirmPassword')
    });
  }

  hasLowercase(password: string): boolean {
    return this.hasLowercaseRegex.test(password || '');
  }

  hasUppercase(password: string): boolean {
    return this.hasUppercaseRegex.test(password || '');
  }

  hasDigit(password: string): boolean {
    return this.hasDigitRegex.test(password || '');
  }

  hasSpecialChar(password: string): boolean {
    return this.hasSpecialCharRegex.test(password || '');
  }

  hasMinLength(password: string): boolean {
    return this.hasMinLengthRegex.test(password || '');
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      const { currentPassword, newPassword } = this.passwordForm.value;

      this.userService.updatePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.notificationsService.showSuccess(
            'Succès',
            'Mot de passe mis à jour avec succès, vous allez être déconnecté dans 3 secondes'
          );
          this.passwordForm.reset();
          setTimeout(() => {this.authService.disconnection();}, 3000);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.handleError(error);
        }
      });
    } else {
      this.notificationsService.showError(
        'Attention',
        'Veuillez corriger les erreurs dans le formulaire'
      );
    }
  }

  private handleError(error: any): void {

    if (error.status === 400) {
      console.log('Affichage toast pour erreur 400');
      this.notificationsService.showError(
        'Erreur',
        'Mot de passe actuel incorrect'
      );
    } else if (error.status === 401) {
      this.notificationsService.showError(
        'Session expirée',
        'Veuillez vous reconnecter'
      );
      this.authService.disconnection();
    } else if (error.status === 500) {
      this.notificationsService.showError(
        'Erreur serveur',
        'Une erreur interne s\'est produite. Veuillez réessayer plus tard.'
      );
    } else {
      this.notificationsService.showError(
        'Erreur',
        'Impossible de mettre à jour le mot de passe'
      );
    }
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
  }
}
