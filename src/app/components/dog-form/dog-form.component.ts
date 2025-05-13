import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dog, Gender} from '../../models/dog';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {IftaLabel} from 'primeng/iftalabel';
import {NgIf} from '@angular/common';


interface GenderOption {
  label: string;
  value: Gender;
}

@Component({
  selector: 'app-dog-form',
  imports: [
    InputText,
    FormsModule,
    Select,
    IftaLabel,
    NgIf
  ],
  templateUrl: './dog-form.component.html',
  styleUrl: './dog-form.component.scss'
})
export class DogFormComponent implements OnInit {
  http = inject(HttpClient)
  dogs: Dog[] = [];
  selectedDog: Dog | null = null;
  genderOptions: GenderOption[];

  constructor() {
    this.genderOptions = [
      { label: 'Mâle', value: Gender.MALE },
      { label: 'Femelle', value: Gender.FEMALE },
      { label: 'Mâle stérilisé', value: Gender.STERILIZED_MALE },
      { label: 'Femelle stérilisée', value: Gender.STERILIZED_FEMALE }
    ];
  }



  ngOnInit() {
    this.http.get<Dog[]>('http://localhost:8080/owner/3/dogs').subscribe({
      next: (dogs) => {
        this.dogs = dogs;
        if (this.dogs.length > 0) {
          this.selectedDog = this.dogs[0];
        }
        console.log(dogs);
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });

  }
  saveDog() {
    if (!this.selectedDog) return;

    this.http.post('http://localhost:8080/dog/1', this.selectedDog).subscribe({
      next: (response) => {
        console.log('Dog updated successfully', response);
      },
      error: (error) => {
        console.error('Error updating dog:', error);
      }
    });
  }


  protected readonly Gender = Gender;
}
