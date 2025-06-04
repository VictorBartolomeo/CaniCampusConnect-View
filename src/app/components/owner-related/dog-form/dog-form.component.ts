import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select'; // ✅ Ajout du Select
import { Button } from 'primeng/button';
import { Calendar } from 'primeng/calendar';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Dog } from '../../../models/dog';
import { Breed } from '../../../models/breed';
import { Gender } from '../../../models/gender.enum';
import { GENDER_OPTIONS } from '../../../models/gender.options'; // ✅ Import des options
import { DogService } from '../../../service/dog.service';
import {DatePicker} from 'primeng/datepicker';

@Component({
  selector: 'app-dog-form',
  templateUrl: './dog-form.component.html',
  standalone: true,
  imports: [
    CommonModule, // ✅ Pour la syntaxe @if
    ReactiveFormsModule,
    InputText,
    MultiSelect,
    Select, // ✅ Ajout du Select
    Button,
    Calendar,
    DatePicker
  ],
  styleUrls: ['./dog-form.component.scss']
})
export class DogFormComponent implements OnInit, OnDestroy {
  today: Date = new Date();
  availableBreeds: Breed[] = [];
  updatedDog: Dog | null = null;
  dogSubscription: Subscription | null = null;
  apiUrl = 'http://localhost:8080';

  genderOptions = GENDER_OPTIONS;

  http = inject(HttpClient);
  dogService = inject(DogService);

  formBuilder = inject(FormBuilder);
  form = this.formBuilder.group({
    name: ['', Validators.required],
    breed: [[] as Breed[], [Validators.required, Validators.minLength(1)]],
    chipNumber: ['', Validators.required],
    birthDate: [null as Date | null, Validators.required],
    gender: ['', Validators.required],
    avatar: [null]
  });

  ngOnInit() {
    this.http.get<Breed[]>(`${this.apiUrl}/breeds`).subscribe({
      next: (breeds) => {
        this.availableBreeds = breeds;
        console.log('Races disponibles:', this.availableBreeds);
        this.subscribeToActiveDog();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des races:', error);
      }
    });
  }

  subscribeToActiveDog() {
    this.dogSubscription = this.dogService.activeDog$.subscribe({
      next: (dog: Dog | null) => {
        if (dog) {
          console.log('Chien actif reçu:', dog);
          this.updatedDog = dog;

          const selectedBreeds = this.mapDogBreedsToAvailableBreeds(dog.breeds || []);

            this.form.patchValue({
              name: dog.name,
              breed: selectedBreeds,
              chipNumber: dog.chipNumber,
              birthDate: dog.birthDate ? new Date(dog.birthDate) : null,
              gender: dog.gender,
              avatar: null
            });
        }
      },
      error: (error: any) => {
        console.error('Erreur avec le chien actif:', error);
      }
    });
  }

  mapDogBreedsToAvailableBreeds(dogBreeds: Breed[]): Breed[] {
    if (!dogBreeds || !dogBreeds.length) {
      console.warn('Pas de races à mapper', dogBreeds);
      return [];
    }

    console.log('Breeds du chien avant mapping:', dogBreeds);
    console.log('Races disponibles pour mapper:', this.availableBreeds);

    const result: Breed[] = [];

    dogBreeds.forEach(dogBreed => {
      const matchingBreed = this.availableBreeds.find(breed => breed.name === dogBreed.name);

      if (matchingBreed) {
        console.log(`Race trouvée: ${matchingBreed.name} (id: ${matchingBreed.id})`);
        result.push(matchingBreed);
      } else {
        console.warn(`Race "${dogBreed.name}" non trouvée dans les races disponibles`);
      }
    });

    console.log('Résultat du mapping des races:', result);
    return result;
  }

  onSubmitEdit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.updatedDog || !this.updatedDog.id) {
      console.error('ID du chien manquant');
      return;
    }

    const formBreeds = this.form.value.breed || [];

    // ✅ Créer l'objet avec le genre mis à jour
    const dogData = {
      id: this.updatedDog.id,
      name: this.form.value.name,
      birthDate: this.form.value.birthDate,
      chipNumber: this.form.value.chipNumber,
      gender: this.form.value.gender, // ✅ Genre mis à jour
      breeds: formBreeds.length > 0 ? formBreeds : this.updatedDog.breeds,
    };

    console.log('Données à envoyer pour la mise à jour:', dogData);

    this.http.put(`${this.apiUrl}/dog/${this.updatedDog.id}`, dogData).subscribe({
      next: (response) => {
        console.log('Chien mis à jour avec succès:', response);
        this.dogService.loadUserDogs();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du chien:', error);
        if (error.error && error.error.message) {
          console.error('Message d\'erreur:', error.error.message);
        }
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  ngOnDestroy() {
    if (this.dogSubscription) {
      this.dogSubscription.unsubscribe();
    }
  }
}
