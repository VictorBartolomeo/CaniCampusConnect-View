import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Breed } from '../../../models/breed';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Dog } from '../../../models/dog';
import { MultiSelect } from 'primeng/multiselect';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Calendar } from 'primeng/calendar';
import { DogService } from '../../../service/dog.service';

@Component({
  selector: 'app-dog-form',
  templateUrl: './dog-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputText,
    MultiSelect,
    Button,
    Calendar
  ],
  styleUrls: ['./dog-form.component.scss']
})
export class DogFormComponent implements OnInit, OnDestroy {
  today: Date = new Date();
  availableBreeds: Breed[] = [];
  updatedDog: Dog | null = null;
  dogSubscription: Subscription | null = null;
  apiUrl = 'http://localhost:8080';

  http = inject(HttpClient);
  dogService = inject(DogService);

  formBuilder = inject(FormBuilder);
  form = this.formBuilder.group({
    name: ['', Validators.required],
    breed: [[] as Breed[], [Validators.required, Validators.minLength(1)]],
    chipNumber: ['', Validators.required],
    birthDate: [null as Date | null, Validators.required],
    avatar: [null]
  });

  ngOnInit() {
    this.http.get<Breed[]>(`${this.apiUrl}/breeds`).subscribe({
      next: (breeds) => {
        this.availableBreeds = breeds;
        console.log('Races disponibles:', this.availableBreeds);

        // S'abonner au chien actif
        this.subscribeToActiveDog();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des races:', error);
      }
    });
  }

  subscribeToActiveDog() {
    this.dogSubscription = this.dogService.activeDog$.subscribe({
      next: (dog: Dog | null) => { // Typez explicitement le paramètre
        if (dog) {
          console.log('Chien actif reçu:', dog);
          this.updatedDog = dog;

          // Mapper les races du chien
          const selectedBreeds = this.mapDogBreedsToAvailableBreeds(dog.breeds || []);

          // Mettre à jour le formulaire
          this.form.patchValue({
            name: dog.name,
            breed: selectedBreeds, // Utiliser les races mappées
            chipNumber: dog.chipNumber,
            birthDate: dog.birthDate ? new Date(dog.birthDate) : null,
            avatar: null
          });
        }
      },
      error: (error: any) => { // Typez explicitement le paramètre
        console.error('Erreur avec le chien actif:', error);
      }
    });
  }

  mapDogBreedsToAvailableBreeds(dogBreeds: Breed[]): Breed[] { // Typez explicitement le paramètre
    if (!dogBreeds || !dogBreeds.length) {
      console.warn('Pas de races à mapper', dogBreeds);
      return [];
    }

    console.log('Breeds du chien avant mapping:', dogBreeds);
    console.log('Races disponibles pour mapper:', this.availableBreeds);

    const result: Breed[] = [];

    dogBreeds.forEach(dogBreed => {
      // Trouver la race correspondante par son nom
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

  // onSubmitEdit() {
  //   if (this.form.invalid) {
  //     this.form.markAllAsTouched();
  //     return;
  //   }
  //
  //   if (!this.updatedDog || !this.updatedDog.id) {
  //     console.error('ID du chien manquant');
  //     return;
  //   }
  //
  //   const dogData = {
  //     ...this.form.value,
  //     id: this.updatedDog.id
  //   };
  //
  //   console.log('Données à envoyer pour la mise à jour:', dogData);
  //
  //   this.http.put(`${this.apiUrl}/dog/${this.updatedDog.id}`, dogData).subscribe({
  //     next: (response) => {
  //       console.log('Chien mis à jour avec succès:', response);
  //       // Mettre à jour le chien actif dans le service si nécessaire
  //       this.dogService.loadUserDogs();
  //     },
  //     error: (error) => {
  //       console.error('Erreur lors de la mise à jour du chien:', error);
  //     }
  //   });
  // }
  onSubmitEdit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.updatedDog || !this.updatedDog.id) {
      console.error('ID du chien manquant');
      return;
    }

    // Assurez-vous que breeds n'est jamais null
    const formBreeds = this.form.value.breed || [];

    // Créer l'objet à envoyer en conservant les propriétés essentielles du chien existant
    const dogData = {
      id: this.updatedDog.id,
      name: this.form.value.name,
      birthDate: this.form.value.birthDate,
      chipNumber: this.form.value.chipNumber,
      gender: this.updatedDog.gender, // Conserver le genre du chien existant
      breeds: formBreeds.length > 0 ? formBreeds : this.updatedDog.breeds, // Utiliser les races du formulaire ou celles existantes
    };

    console.log('Données à envoyer pour la mise à jour:', dogData);

    this.http.put(`${this.apiUrl}/dog/${this.updatedDog.id}`, dogData).subscribe({
      next: (response) => {
        console.log('Chien mis à jour avec succès:', response);
        // Mettre à jour le chien actif dans le service si nécessaire
        this.dogService.loadUserDogs();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du chien:', error);
        // Afficher le détail de l'erreur pour mieux diagnostiquer
        if (error.error && error.error.message) {
          console.error('Message d\'erreur:', error.error.message);
        }
      }
    });
  }


  ngOnDestroy() {
    if (this.dogSubscription) {
      this.dogSubscription.unsubscribe();
    }
  }
}
