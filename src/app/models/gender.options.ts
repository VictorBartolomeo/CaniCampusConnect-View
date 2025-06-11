import { Gender } from './gender.enum';
import {faMars, faMarsStroke, faVenus, faVenusDouble} from '@fortawesome/free-solid-svg-icons';
export interface GenderOptions {
  label: string;
  value: Gender;
  icon: any;
  color: string;
}


export const GENDER_OPTIONS = [
  {
    label: 'Mâle',
    value: 'MALE',
    icon: faMars,
    color: 'text-white'
  },
  {
    label: 'Femelle',
    value: 'FEMALE',
    icon: faVenus,
    color: 'text-white'
  },
  {
    label: 'Mâle stérilisé',
    value: 'STERILIZED_MALE',
    icon: faMarsStroke,
    color: 'text-white'
  },
  {
    label: 'Femelle stérilisée',
    value: 'STERILIZED_FEMALE',
    icon: faVenusDouble,
    color: 'text-white'
  }
];
