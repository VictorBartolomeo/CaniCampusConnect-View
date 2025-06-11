import {Component, inject, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {InputText} from 'primeng/inputtext';
import {DatePicker} from 'primeng/datepicker';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Breed} from '../../../models/breed';
import {GENDER_OPTIONS} from '../../../models/gender.options';
import {MultiSelect} from 'primeng/multiselect';
import {Select} from 'primeng/select';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../../service/auth.service';
import {DogService} from '../../../service/dog.service';
import {BreedService} from '../../../service/breed.service';

interface BreedsSelect {
  label: string;
  value: Breed;
}

@Component({
  selector: 'app-dog-add-form',
  imports: [
    Button,
    Dialog,
    InputText,
    DatePicker,
    ReactiveFormsModule,
    MultiSelect,
    Select,
    CommonModule
  ],
  templateUrl: './dog-add-form.component.html',
  styleUrl: './dog-add-form.component.scss'
})
export class DogAddFormComponent implements OnInit {
  visible: boolean = false;
  today: Date;
  dogBreeds: BreedsSelect[] = [];
  genderOptions = GENDER_OPTIONS;
  serverErrors: { [key: string]: string } = {};
  isLoading: boolean = false;

  // Services injectés
  authService = inject(AuthService);
  dogService = inject(DogService);
  breedService = inject(BreedService);
  formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    name: ['', Validators.required],
    breed: [[] as Breed[], [Validators.required, Validators.minLength(1)]],
    chipNumber: [''],
    birthDate: [null as Date | null, Validators.required],
    gender: ['', Validators.required],
    avatar: [null]
  });

  constructor() {
    this.today = new Date();
  }

  ngOnInit() {
    this.loadBreeds();
  }

  private loadBreeds(): void {
    this.breedService.getAllBreeds().subscribe({
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

  showDialog() {
    this.form.reset();
    this.serverErrors = {};
    this.visible = true;
  }

  onFieldChange(fieldName: string) {
    if (this.serverErrors[fieldName]) {
      delete this.serverErrors[fieldName];
    }
  }

  onSubmitCreate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('❌ Erreur: User ID manquant');
      return;
    }

    this.isLoading = true;
    this.serverErrors = {};

    const dogData = {
      name: this.form.value.name!,
      birthDate: this.dogService.formatDateForBackend(this.form.value.birthDate || null),
      gender: this.form.value.gender!,
      chipNumber: this.form.value.chipNumber || null,
      owner: {
        id: userId
      },
      breeds: (this.form.value.breed || []).map((breed: Breed) => ({
        id: breed.id
      }))
    };

    console.log('📤 Données préparées pour le backend:', dogData);

    this.dogService.createDog(dogData).subscribe({
      next: (response) => {
        console.log('🎉 Chien créé avec succès', response);
        this.visible = false;
        this.form.reset();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création du chien', error);
        this.isLoading = false;
        this.handleServerError(error);
      }
    });
  }

  private handleServerError(error: any): void {
    if (error.status === 409) {
      const errorMessage = error.error?.message || error.message || '';

      if (errorMessage.toLowerCase().includes('chip') ||
        errorMessage.toLowerCase().includes('puce') ||
        errorMessage.toLowerCase().includes('unique') ||
        errorMessage.toLowerCase().includes('duplicate')) {
        this.serverErrors['chipNumber'] = 'Ce numéro de puce est déjà utilisé par un autre chien';
      } else {
        this.serverErrors['general'] = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
      }
    } else if (error.status === 400) {
      if (error.error?.errors) {
        this.serverErrors = error.error.errors;
      } else {
        this.serverErrors['general'] = 'Données invalides. Veuillez vérifier vos informations.';
      }
    } else {
      this.serverErrors['general'] = 'Une erreur est survenue. Veuillez réessayer.';
    }
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    const hasClientError = !!(field && field.invalid && field.touched);
    const hasServerError = !!this.serverErrors[fieldName];
    return hasClientError || hasServerError;
  }

  getFieldErrorMessage(fieldName: string): string {
    if (this.serverErrors[fieldName]) {
      return this.serverErrors[fieldName];
    }

    const field = this.form.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        const labels: { [key: string]: string } = {
          'name': 'Le nom',
          'birthDate': 'La date de naissance',
          'gender': 'Le genre',
          'breed': 'Au moins une race'
        };
        return `${labels[fieldName] || 'Ce champ'} est requis`;
      }
      if (field.errors?.['minlength']) {
        return 'Au moins une race doit être sélectionnée';
      }
    }

    return '';
  }
}
