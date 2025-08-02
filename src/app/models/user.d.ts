import {Dog} from "./dog";
import {Course} from './course';

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  role?: string; // ✅ AJOUTÉ : Le rôle de l'utilisateur
  validated?: boolean; // ✅ AJOUTÉ : Statut de validation
  registrationDate?: string; // ✅ AJOUTÉ : Date d'inscription
  anonymized?: boolean; // ✅ AJOUTÉ : Statut d'anonymisation
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

export interface UserStatsDto {
  totalUsers: number;
  totalCoaches: number;
  totalOwners: number;
  validatedUsers: number;
  unvalidatedUsers: number;
  anonymizedUsers: number;
}

