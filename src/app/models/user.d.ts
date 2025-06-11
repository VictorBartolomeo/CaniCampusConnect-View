import {Dog} from "./dog";
import {Course} from './course';

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
}

export interface Owner extends User {
  registrationDate?: string;
  dogs?: Dog[];
  active?: boolean;
}

export interface Coach extends User {
  acacedNumber?: string;
  registrationDate?: string;
  active?: boolean;
  courses?: Course[];
}

export interface ClubOwner extends User {
  club?: Club;
}
