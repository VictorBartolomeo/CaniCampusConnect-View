import { AbstractControl, ValidatorFn } from '@angular/forms';

export class PhoneValidator {
  // Pattern pour numéros français : 0123456789 ou +33123456789
  private static readonly PHONE_PATTERN = /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/;

  // Alternative simple si vous préférez juste 10 chiffres :
  // private static readonly PHONE_PATTERN = /^[0-9]{10}$/;

  static validPhone(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Ne pas valider si vide (champ optionnel)
      }
      const valid = PhoneValidator.PHONE_PATTERN.test(control.value);
      return valid ? null : { invalidPhone: true };
    };
  }
}
