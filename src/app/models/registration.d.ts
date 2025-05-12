import {Dog} from './dog';
import {Course} from './course';

type Registration = {
  registrationId: number;
  course: Course;
  dog: Dog;
  registrationDate: string | null;
  status: RegistrationStatus | null;
}

enum RegistrationStatus {
  "PENDING",
  "CONFIRMED",
  "CANCELED",
  "REFUSED"
}
