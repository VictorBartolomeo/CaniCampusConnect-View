import {Component, inject, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {InputText} from 'primeng/inputtext';
import {DatePicker} from 'primeng/datepicker';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Breed} from '../../../models/breed';
import {MultiSelect} from 'primeng/multiselect';
import {HttpClient} from '@angular/common/http';

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
    MultiSelect
  ],
  templateUrl: './dog-add-form.component.html',
  styleUrl: './dog-add-form.component.scss'
})
export class DogAddFormComponent implements OnInit {
  visible: boolean = false;
  today: Date;
  http = inject(HttpClient);
  dogBreeds: BreedsSelect[] = [];

  formBuilder = inject(FormBuilder);
  form = this.formBuilder.group({
    name: ['', Validators.required],
    breed: [[] as Breed[], [Validators.required, Validators.minLength(1)]],
    chipNumber: ['', Validators.required],
    birthDate: [null as Date | null, Validators.required],
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
    this.form.reset(); // Optionnel: réinitialiser le formulaire à chaque ouverture
    this.visible = true;
  }

  onSubmitCreate() {
    if (this.form.valid) {
      console.log('Formulaire soumis ! Valeurs:', this.form.value);
      // Ici, vous mettriez votre logique pour créer le chien,
      // par exemple, un appel HTTP POST.
      // this.http.post('VOTRE_ENDPOINT_API', this.form.value).subscribe({
      //   next: (response) => {
      //     console.log('Chien créé avec succès', response);
      //     this.visible = false; // Fermer le dialogue en cas de succès
      //     this.form.reset(); // Réinitialiser le formulaire
      //     // Afficher un message de succès, etc.
      //   },
      //   error: (error) => {
      //     console.error('Erreur lors de la création du chien', error);
      //     // Gérer l'erreur, afficher un message d'erreur, etc.
      //   }
      // });

      // Pour l'exemple, nous allons juste fermer le dialogue et réinitialiser.
      // Remplacez ceci par votre logique réelle.
      alert('Chien ajouté (simulation) !');
      this.visible = false;
      this.form.reset();

    } else {
      console.log('Le formulaire est invalide.');
      // Marquer tous les champs comme "touchés" pour afficher les messages d'erreur de validation
      this.form.markAllAsTouched();
    }
  }
}
