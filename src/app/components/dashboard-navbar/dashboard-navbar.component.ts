import {Component} from '@angular/core';
import {MatFormField} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {FormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {NgOptimizedImage} from '@angular/common';

import {Dog} from '../../models/dog'

@Component({
  selector: 'app-dashboard-navbar',
  imports: [
    MatSelect,
    MatSelect,
    MatOption,
    MatFormField,
    FormsModule,
    NgOptimizedImage,
    MatSelectModule
  ],
  templateUrl: './dashboard-navbar.component.html',
  styleUrl: './dashboard-navbar.component.scss'
})
export class DashboardNavbarComponent {

  dogs: Dog[] = [
    {
      id: 101,
      name: 'Charlie',
      birthDate: '2022-05-10',
      isMale: true,
      isSociable: true,
      isInHeat: false,
      isCrossbreed: false,
      chipNumber: '250269609123456',
      registrations: [],
      vaccinations: [
        {id: 1, vaccineName: 'CHPPiL', vaccinationDate: '2024-03-15'}
      ],
      veterinaryVisits: [],
      medicationTreatments: null,
      dogWeights: [
        {id: 1, weightInKg: 8.5, weighingDate: '2025-04-01'}
      ],
      avatarUrl: '/assets/images/avatars/charlie_pug.jpg', // Chemin exemple
    },
    {
      id: 102,
      name: 'Bella',
      birthDate: '2019-11-25',
      isMale: false,
      isSociable: false,
      isInHeat: false,
      isCrossbreed: true,
      chipNumber: null,
      registrations: null,
      vaccinations: [],
      veterinaryVisits: [],
      medicationTreatments: [],
      dogWeights: [],
      avatarUrl: 'https://via.placeholder.com/50/aabbcc/ffffff?text=Max'
    },
    {
      id: 103,
      name: 'Max',
      birthDate: null,
      isMale: true,
      isSociable: true,
      isInHeat: false,
      isCrossbreed: false,
      chipNumber: '250269609789123',
      avatarUrl: 'https://via.placeholder.com/50/aabbcc/ffffff?text=Max',
    }
  ];

  selectedDog: Dog | null = null;
  dog: any;
}



