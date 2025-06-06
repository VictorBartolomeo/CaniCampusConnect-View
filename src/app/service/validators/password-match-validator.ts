import { AbstractControl, ValidatorFn } from '@angular/forms';

export class PasswordMatchValidator {

  static passwordsMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (form: AbstractControl): { [key: string]: any } | null => {
      const password = form.get(passwordField);
      const confirmPassword = form.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        // Ajouter l'erreur au champ de confirmation
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        // Nettoyer l'erreur si les mots de passe correspondent
        if (confirmPassword.errors?.['passwordMismatch']) {
          delete confirmPassword.errors['passwordMismatch'];
          if (Object.keys(confirmPassword.errors).length === 0) {
            confirmPassword.setErrors(null);
          }
        }
      }
      return null;
    };
  }
}
