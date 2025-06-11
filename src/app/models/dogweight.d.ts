import {Dog} from "./dog";

export type DogWeight = {
  id: number;
  measurementDate: Date;
  weightValue: number;
  unit: string;
  dog: Dog;

}
