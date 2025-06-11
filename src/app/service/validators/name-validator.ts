import { AbstractControl, ValidatorFn } from '@angular/forms';

export class NameValidator {
  // Pattern pour noms/prénoms : lettres, espaces, tirets, apostrophes et accents
  private static readonly NAME_PATTERN = /^[a-zA-ZÀ-ÿ\s\-']{1,100}$/;

  static validName(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Ne pas valider si vide (c'est le rôle de required)
      }
      const valid = NameValidator.NAME_PATTERN.test(control.value);
      return valid ? null : { invalidName: true };
    };
  }
}
