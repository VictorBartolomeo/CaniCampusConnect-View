import { AbstractControl, ValidatorFn } from '@angular/forms';

export class PasswordValidator {
  // Pattern identique à votre backend
  private static readonly REGEX_STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,64}$/;

  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const valid = PasswordValidator.REGEX_STRONG_PASSWORD.test(control.value);
      return valid ? null : { strongPassword: true };
    };
  }
}
