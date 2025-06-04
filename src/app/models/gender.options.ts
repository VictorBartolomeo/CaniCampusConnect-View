import { Gender } from './gender.enum';

export interface GenderOptions {
  label: string;
  value: Gender;
  icon: string;
  color: string;
}

export const GENDER_OPTIONS = [
  {
    label: 'Mâle',
    value: 'MALE',
    icon: 'pi pi-mars',
    color: 'text-blue-500'
  },
  {
    label: 'Femelle',
    value: 'FEMALE',
    icon: 'pi pi-venus',
    color: 'text-pink-500'
  },
  {
    label: 'Mâle stérilisé',
    value: 'STERILIZED_MALE',
    icon: 'pi pi-mars',
    color: 'text-blue-400'
  },
  {
    label: 'Femelle stérilisée',
    value: 'STERILIZED_FEMALE',
    icon: 'pi pi-venus',
    color: 'text-pink-400'
  }
];
