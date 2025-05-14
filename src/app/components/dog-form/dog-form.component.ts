import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dog} from '../../models/dog';
import {InputText} from 'primeng/inputtext';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {IftaLabelModule} from 'primeng/iftalabel';
import {Breed} from '../../models/breed';
import {DropdownModule} from 'primeng/dropdown';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {DatePickerModule} from 'primeng/datepicker';
import {ActivatedRoute} from '@angular/router';
import {FileUpload, UploadEvent} from 'primeng/fileupload';
import {MessageService} from 'primeng/api';
import {MultiSelect} from 'primeng/multiselect';

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
    FileUpload,
    MultiSelect
  ],
  templateUrl: './dog-form.component.html',
  styleUrl: './dog-form.component.scss',
  providers: [MessageService]
})

export class DogFormComponent implements OnInit {
  http = inject(HttpClient)
  dogs: Dog[] = [];
  dogBreeds: BreedsSelect[] = [];
  today: Date;
  updatedDog: Dog | null = null;
  activatedRoute = inject(ActivatedRoute);
  messageService = inject(MessageService);

  constructor() {
    this.today = new Date();
  }

  formBuilder = inject(FormBuilder);
  form = this.formBuilder.group({
    name: ['', Validators.required],
    breed: [[] as Breed[], Validators.minLength(1)],
    chipNumber: [''],
    birthDate: [null as Date | null, Validators.required],
  })

  ngOnInit() {
    this.activatedRoute.params.subscribe(parameter => {
      if (parameter['id']) {
        this.http.get<Dog>(`http://localhost:8080/dog/${parameter['id']}`)
          .subscribe(dog => {
            this.form.patchValue(dog)
            this.updatedDog = dog;
          })
      }
    });

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

  onSubmitEdit() {
    if (this.updatedDog) {

      const ownerId = 3;
      const dogId = this.updatedDog.id;


      const endpointUrl = `http://localhost:8080/owner/${ownerId}/dogs/${dogId}`;

      this.http.put<Dog>(endpointUrl, this.updatedDog).subscribe({
        next: (updatedDogFromServer) => {
          console.log('Chien mis à jour avec succès:', updatedDogFromServer);

          this.updatedDog = {
            ...updatedDogFromServer,
            birthDate: new Date(updatedDogFromServer.birthDate)
          };

          // Mettre à jour le chien dans la liste this.dogs pour refléter les changements
          const index = this.dogs.findIndex(d => d.id === updatedDogFromServer.id);
          if (index !== -1) {
            this.dogs[index] = this.updatedDog;
          }
        }
      });
    } else {
      console.error('Aucun chien sélectionné ou ID du chien manquant. La mise à jour ne peut pas continuer.');
    }
  }

  onUpload(event: UploadEvent) {
    this.messageService.add({severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode'});
  }

  addDog() {
    //méthode d'ajout d'un chien
  }
}
