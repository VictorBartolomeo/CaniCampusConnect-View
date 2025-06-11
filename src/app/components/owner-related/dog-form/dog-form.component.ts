
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {InputText} from 'primeng/inputtext';
import {MultiSelect} from 'primeng/multiselect';
import {Select} from 'primeng/select';
import {Button} from 'primeng/button';
import {Calendar} from 'primeng/calendar';
import {HttpClient} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {DatePicker} from 'primeng/datepicker';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import {Dog} from '../../../models/dog';
import {Breed} from '../../../models/breed';
import {GENDER_OPTIONS} from '../../../models/gender.options';
import {DogService} from '../../../service/dog.service';
import {Card} from 'primeng/card';
import {ConfirmDialogModule} from 'primeng/confirmdialog';

@Component({
  selector: 'app-dog-form',
  templateUrl: './dog-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    MultiSelect,
    Select,
    Button,
    DatePicker,
    Card,
    ConfirmDialogModule
    // Retiré Router et MessageService des imports car ce ne sont pas des composants
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
  router = inject(Router);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  form = this.formBuilder.group({
    name: ['', Validators.required],
    breed: [[] as Breed[], [Validators.required, Validators.minLength(1)]],
    chipNumber: [''],
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

  confirmUpdate(event: Event): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.updatedDog || !this.updatedDog.id) {
      console.error('ID du chien manquant');
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Êtes-vous sûr de vouloir mettre à jour les informations de ${this.updatedDog.name} ?`,
      header: 'Confirmation de mise à jour',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, mettre à jour',
      rejectLabel: 'Non, annuler',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-outlined',
      accept: () => {
        this.onSubmitEdit();
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Annulé',
          detail: 'La mise à jour a été annulée',
          life: 1500
        });
      }
    });
  }

  onSubmitEdit() {
    const formBreeds = this.form.value.breed || [];

    const dogData = {
      id: this.updatedDog!.id,
      name: this.form.value.name!,
      birthDate: this.dogService.formatDateForBackend(this.form.value.birthDate || null),
      chipNumber: this.form.value.chipNumber!,
      gender: this.form.value.gender!,
      breeds: formBreeds.map((breed: Breed) => ({ id: breed.id }))
    };

    console.log('📤 Données préparées pour la mise à jour:', dogData);

    this.dogService.updateDog(dogData).subscribe({
      next: (response) => {
        console.log('🎉 Chien mis à jour avec succès', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Chien mis à jour avec succès.'
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour du chien', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la mise à jour du chien.'
        });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  deleteDog(event?: Event): void {
    // Correction : utilisation d'updatedDog au lieu de dog
    if (this.updatedDog?.id) {
      this.confirmationService.confirm({
        target: event?.target as EventTarget,
        message: `Êtes-vous sûr de vouloir supprimer ${this.updatedDog.name} ? Cette action est irréversible.`,
        header: 'Confirmation de suppression',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui, supprimer',
        rejectLabel: 'Non, annuler',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-outlined',
        accept: () => {
          this.dogService.deleteDog(this.updatedDog!.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `${this.updatedDog!.name} a été supprimé avec succès.`
              });
              // Rediriger vers la liste des chiens
              this.router.navigate(['/dashboard/owner-profile']);
            },
            error: (error) => {
              console.error('Erreur lors de la suppression:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la suppression du chien.'
              });
            }
          });
        },
        reject: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Annulé',
            detail: 'La suppression a été annulée',
            life: 1500
          });
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.dogSubscription) {
      this.dogSubscription.unsubscribe();
    }
  }
}
