import {Dog} from "./dog";

export type Owner = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  registrationDate?: string;
  dogs?: Dog[];
  active?: boolean;

}
