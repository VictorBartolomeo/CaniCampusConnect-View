import {Dog} from "./dog";

export type VeterinaryVisit = {
  visitDate: Date;
  diagnosis: string;
  reasonForVisit : string;
  treatment : string;
  veterinarian : string;
  dog : Dog;
}
