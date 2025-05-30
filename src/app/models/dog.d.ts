import {Registration} from "./registration";
import {DogWeight} from './dogweight';
import {Vaccination} from './vaccination';
import {VeterinaryVisit} from './veterinaryvisit';
import {MedicationTreatment} from './medicationtreatment';
import {Breed} from './breed';
import {Gender} from './gender.enum';
import {Course} from './course';
import {Owner} from './user';

export type Dog = {
  id: number;
  name: string;
  birthDate: Date;
  gender: Gender;
  chipNumber: string;
  breeds: Breed[];
  registrations?: Registration[] | null;
  vaccinations?: Vaccination[];
  veterinaryVisits?: VeterinaryVisit[];
  medicationTreatments?: MedicationTreatment[] | null;
  dogWeights?: DogWeight[];
  avatarUrl?: string | null;
  courses?: Course[];
  owner: Owner;
}
