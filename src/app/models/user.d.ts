import {Dog} from "./dog";

export type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  registrationDate?: string;
  address?: string;
  dogs?: Dog[];
  active?: boolean;

}
