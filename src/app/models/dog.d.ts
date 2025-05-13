import {Registration} from "./registration.d.ts";
import {DogWeight} from './dogweight';
import {Vaccination} from './vaccination';
import {VeterinaryVisit} from './veterinaryvisit';

type Dog = {
  id: number;
  name: string;
  birthDate: Date;
  isMale?: boolean;
  chipNumber?: string | null;
  breed: Breed;
  registrations?: Registration[] | null;
  vaccinations?: Vaccination[];
  veterinaryVisits?: VeterinaryVisit[];
  medicationTreatments?: MedicationTreatment[] | null;
  dogWeights?: DogWeight[];
  avatarUrl?: string | null;
}
