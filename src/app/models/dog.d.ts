import {Registration} from "./registration.d.ts";
import {DogWeight} from './dogweight';

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
  vaccinations?: Vaccination[] | null;
  veterinaryVisits?: VeterinaryVisit[] | null;
  medicationTreatments?: MedicationTreatment[] | null;
  dogWeights?: DogWeight[];
  avatarUrl?: string | null;
}
