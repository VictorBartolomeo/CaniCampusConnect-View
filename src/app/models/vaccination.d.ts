import {Dog} from "./dog";

type Vaccine = {
  id: number;
  name: string;
  renewDelay: number;
}

type Vaccination = {
  vaccinationDate: Date;
  reminderDate: Date;
  batchNumber : string;
  veterinarian : string;
  dog : Dog;
  vaccine : Vaccine;
}
