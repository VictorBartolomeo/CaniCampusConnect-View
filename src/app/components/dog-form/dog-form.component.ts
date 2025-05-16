import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MultiSelect } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageService } from 'primeng/api';
import { Dog } from '../../models/dog';
import { Breed } from '../../models/breed';
import { DogService } from '../../service/dog.service';
import { Subscription } from 'rxjs';

interface BreedsSelect {
  label: string;
  value: Breed;
}

@Component({
  selector: 'app-dog-form',
  imports: [
    InputText,
    FormsModule,
    IftaLabelModule,
    DropdownModule,
    CommonModule,
    ButtonModule,
    DatePickerModule,
    ReactiveFormsModule,
    MultiSelect
  ],
  templateUrl: './dog-form.component.html',
  styleUrl: './dog-form.component.scss',
  providers: [MessageService]
})
export class DogFormComponent implements OnInit, OnDestroy {
  http = inject(HttpClient);
  dogBreeds: BreedsSelect[] = [];
  today: Date;
  updatedDog: Dog | null = null;
  messageService = inject(MessageService);
  private subscription!: Subscription;

  constructor(private dogService: DogService, private fb: FormBuilder) {
    this.today = new Date();
  }

  formBuilder = inject(FormBuilder);
  form = this.formBuilder.group({
    name: ['', Validators.required],
    breed: [[] as Breed[], [Validators.minLength(1), Validators.required]],
    chipNumber: ['', Validators.required],
    birthDate: [null as Date | null, Validators.required],
    avatar: [null]
  });

  ngOnInit() {
    // Charger les races de chiens
    this.loadBreeds();

    // S'abonner aux changements du chien actif
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      if (dog) {
        // Mettre à jour le formulaire avec les données du chien actif
        this.patchFormWithDogData(dog);
        console.log('Dog form updated for dog:', dog.name);
      } else {
        // Réinitialiser le formulaire si aucun chien n'est sélectionné
        this.form.reset();
        this.updatedDog = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadBreeds() {
    this.http.get<Breed[]>('http://localhost:8080/breeds').subscribe({
      next: (breeds) => {
        this.dogBreeds = breeds.map(breed => ({
          label: breed.name,
          value: breed
        }));
      },
      error: (error) => {
        console.error('Error fetching breeds:', error);
      },
    });
  }

  patchFormWithDogData(dog: Dog) {
    this.updatedDog = { ...dog };
    const formDataToPatch = {
      ...dog,
      birthDate: dog.birthDate ? new Date(dog.birthDate) : null,
      breed: dog.breeds || []
    };

    this.form.patchValue(formDataToPatch);
  }

  onSubmitEdit() {
    if (this.form.invalid) {
      this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Veuillez remplir tous les champs obligatoires.'});
      this.form.markAllAsTouched();
      return;
    }

    if (this.updatedDog) {
      // Préparer les données pour la mise à jour
      const formData = this.form.value;

      // Mettre à jour l'objet dog avec les nouvelles valeurs du formulaire
      const dogToUpdate = {
        ...this.updatedDog,
        name: formData.name || this.updatedDog.name,
        breeds: formData.breed || this.updatedDog.breeds,
        chipNumber: formData.chipNumber || this.updatedDog.chipNumber,
        birthDate: formData.birthDate || this.updatedDog.birthDate,
        // Autres propriétés à mettre à jour
      };

      const ownerId = 3; // Vous pourriez récupérer cela depuis un service d'authentification
      const dogId = this.updatedDog.id;
      const endpointUrl = `http://localhost:8080/owner/${ownerId}/dogs/${dogId}`;

      this.http.put<Dog>(endpointUrl, dogToUpdate).subscribe({
        next: (updatedDogFromServer) => {
          console.log('Chien mis à jour avec succès:', updatedDogFromServer);

          // Mettre à jour le chien actif dans le service pour que tous les composants soient notifiés
          this.dogService.getDogDetails(updatedDogFromServer.id).subscribe({
            next: (refreshedDog) => {
              this.messageService.add({severity: 'success', summary: 'Succès', detail: 'Les informations du chien ont été mises à jour.'});
            },
            error: (error) => {
              console.error('Erreur lors du rafraîchissement des détails du chien:', error);
            }
          });
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du chien:', error);
          this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue lors de la mise à jour du chien.'});
        }
      });
    } else {
      console.error('Aucun chien sélectionné ou ID du chien manquant. La mise à jour ne peut pas continuer.');
      this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Aucun chien sélectionné pour la mise à jour.'});
    }
  }

  // Méthode pour réinitialiser le formulaire
  resetForm() {
    this.form.reset();
    this.updatedDog = null;
  }
}
