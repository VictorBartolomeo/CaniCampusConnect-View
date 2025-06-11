import {Dog} from "./dog";

export type MedicationTreatment = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate: Date;
  reason : string;
  dog : Dog;

}
