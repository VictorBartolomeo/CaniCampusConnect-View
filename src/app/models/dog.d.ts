import {Registration} from "./registration.d.ts";
import {DogWeight} from './dogweight';
import {Vaccination} from './vaccination';
import {VeterinaryVisit} from './veterinaryvisit';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  STERILIZED_MALE = 'STERILIZED_MALE',
  STERILIZED_FEMALE = 'STERILIZED_FEMALE'
}


export type Dog = {
  id: number;
  name: string;
  birthDate: Date;
  gender: string;
  chipNumber?: string | null;
  breeds: Breed[];
  registrations?: Registration[] | null;
  vaccinations?: Vaccination[];
  veterinaryVisits?: VeterinaryVisit[];
  medicationTreatments?: MedicationTreatment[] | null;
  dogWeights?: DogWeight[];
  avatarUrl?: string | null;
}
