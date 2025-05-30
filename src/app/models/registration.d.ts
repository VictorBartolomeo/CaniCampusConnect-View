import {Dog} from './dog';
import {Course} from './course';
import {RegistrationStatus} from './registrationstatus.enum';

export type Registration = {
  id: number;
  registrationId: number;
  course: Course;
  dog: Dog;
  registrationDate: string;
  status: RegistrationStatus;
}

export interface RegistrationRequest {
  dog: { id: number };
  course: { id: number };
}
