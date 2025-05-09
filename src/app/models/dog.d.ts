import {Registration} from "./registration.d.ts";
import {DogWeight} from './dogweight';
import {Vaccination, Vaccine} from './vaccination';
import {VeterinaryVisit} from './veterinaryvisit';

type Dog = {
  id: number;
  name: string;
  birthDate?: string | null;
  isMale?: boolean;
  isSociable?: boolean;
  isInHeat?: boolean;
  isCrossbreed?: boolean;
  chipNumber?: string | null;
  breed?: Breed;
  registrations?: Registration[] | null;
  vaccinations?: Vaccination[];
  veterinaryVisits?: VeterinaryVisit[];
  medicationTreatments?: MedicationTreatment[] | null;
  dogWeights?: DogWeight[];
  avatarUrl?: string | null;
}
