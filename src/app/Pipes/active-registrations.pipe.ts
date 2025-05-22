import { Pipe, PipeTransform } from '@angular/core';
import {Registration} from '../models/registration';
import { RegistrationStatus } from '../models/registrationstatus.enum';

@Pipe({
  name: 'activeRegistrations',
  standalone: true
})
export class ActiveRegistrationsPipe implements PipeTransform {
  transform(registrations: Registration[] | undefined): number {
    if (!registrations) return 0;

    return registrations.filter(r =>
      r.status === RegistrationStatus.PENDING ||
      r.status === RegistrationStatus.CONFIRMED
    ).length;
  }
}
