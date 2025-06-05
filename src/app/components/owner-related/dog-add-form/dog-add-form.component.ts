import {Component, inject, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {InputText} from 'primeng/inputtext';
import {DatePicker} from 'primeng/datepicker';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Breed} from '../../../models/breed';
import {GENDER_OPTIONS, GenderOptions} from '../../../models/gender.options';
import {MultiSelect} from 'primeng/multiselect';
import {Select} from 'primeng/select';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../../service/auth.service';
import {DogService} from '../../../service/dog.service';

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
  http = inject(HttpClient);
  dogBreeds: BreedsSelect[] = [];
  authService = inject(AuthService);
  dogService = inject(DogService);
  genderOptions = GENDER_OPTIONS;

  serverErrors: { [key: string]: string } = {};
  isLoading: boolean = false;

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

  showDialog() {
    this.form.reset();
    this.serverErrors = {}; // ✅ Réinitialiser les erreurs serveur
    this.visible = true;
  }

  onFieldChange(fieldName: string) {
    if (this.serverErrors[fieldName]) {
      delete this.serverErrors[fieldName];
    }
  }

  onSubmitCreate() {
    if (this.form.valid) {
      console.log('✅ Formulaire valide - Création en cours...');

      this.isLoading = true;
      this.serverErrors = {};

      const userId = this.authService.getUserId();
      if (!userId) {
        console.error('❌ Erreur: User ID manquant');
        this.isLoading = false;
        return;
      }

      const dogData = {
        name: this.form.value.name,
        birthDate: this.form.value.birthDate?.toISOString().split('T')[0],
        gender: this.form.value.gender,
        chipNumber: this.form.value.chipNumber || null,
        owner: {
          id: userId
        },
        breeds: (this.form.value.breed || []).map((breed: Breed) => ({
          id: breed.id
        }))
      };

      console.log('📤 Données préparées pour le backend:', dogData);

      //TODO Refacto ici avec le dogService
      this.http.post('http://localhost:8080/dog', dogData).subscribe({
        next: (response) => {
          console.log('🎉 Chien créé avec succès', response);
          this.visible = false;
          this.form.reset();
          this.dogService.loadUserDogs();
          this.isLoading = false; // ✅ Désactiver le loading
        },
        error: (error) => {
          console.error('❌ Erreur lors de la création du chien', error);
          this.isLoading = false; // ✅ Désactiver le loading

          // ✅ Gérer les différents types d'erreurs
          if (error.status === 409) {
            // Vérifier si c'est une erreur de contrainte d'unicité pour le numéro de puce
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
            // Erreurs de validation
            if (error.error?.errors) {
              // Si le backend retourne des erreurs structurées
              this.serverErrors = error.error.errors;
            } else {
              this.serverErrors['general'] = 'Données invalides. Veuillez vérifier vos informations.';
            }
          } else {
            this.serverErrors['general'] = 'Une erreur est survenue. Veuillez réessayer.';
          }
        }
      });

    } else {
      console.log('❌ Le formulaire est invalide.');
      this.form.markAllAsTouched();
    }
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    const hasClientError = !!(field && field.invalid && field.touched);
    const hasServerError = !!this.serverErrors[fieldName];
    return hasClientError || hasServerError;
  }

  // ✅ Méthode pour obtenir le message d'erreur d'un champ
  getFieldErrorMessage(fieldName: string): string {
    // Erreur serveur en priorité
    if (this.serverErrors[fieldName]) {
      return this.serverErrors[fieldName];
    }

    // Erreurs de validation client
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

  // ... autres méthodes inchangées
  getFormErrors() {
    const errors: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  getSelectedGenderIcon(): string {
    const selectedGender = this.form.get('gender')?.value;
    const genderOption = this.genderOptions.find(option => option.value === selectedGender);
    return genderOption?.icon || 'pi pi-question';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
