import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../service/user.service';

@Component({
  selector: 'app-password-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './password-form.component.html',
  styleUrl: './password-form.component.scss',
})
export class PasswordFormComponent {
  passwordForm: FormGroup;
  loading = false;

  // Regex pour un mot de passe fort (correspond à celle du backend)
  strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,64}$/;

  // Regex individuelles pour chaque critère
  hasLowercaseRegex = /[a-z]/;
  hasUppercaseRegex = /[A-Z]/;
  hasDigitRegex = /\d/;
  hasSpecialCharRegex = /\W/;
  hasMinLengthRegex = /.{8,}/;

  constructor(
    private formDataPassword: FormBuilder,
    private userService: UserService,
    private messageService: MessageService
  ) {
    this.passwordForm = this.formDataPassword.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        this.strongPasswordValidator()
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.checkPasswords });
  }

  // Validateur personnalisé pour vérifier que le mot de passe correspond à la regex
  strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Ne pas valider si vide (c'est le rôle de required)
      }
      const valid = this.strongPasswordRegex.test(control.value);
      return valid ? null : { strongPassword: true };
    };
  }

  checkPasswords(group: FormGroup) {
    const pass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  // Méthodes pour vérifier chaque critère individuellement
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
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Mot de passe mis à jour avec succès'
          });
          this.passwordForm.reset();
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de mettre à jour le mot de passe'
          });
          this.loading = false;
          console.error('Erreur lors de la mise à jour du mot de passe:', error);
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez corriger les erreurs dans le formulaire'
      });
    }
  }
}
