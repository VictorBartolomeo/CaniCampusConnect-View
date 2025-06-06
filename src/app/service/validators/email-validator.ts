
import { AbstractControl, ValidatorFn } from '@angular/forms';

export class EmailValidator {
  private static readonly EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  static validEmail(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Ne pas valider si vide (c'est le rôle de required)
      }
      const valid = EmailValidator.EMAIL_PATTERN.test(control.value);
      return valid ? null : { invalidEmail: true };
    };
  }
}
