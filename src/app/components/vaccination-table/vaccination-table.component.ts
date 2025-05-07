import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dog} from '../../models/dog';
import {TableModule} from 'primeng/table';
import {ButtonDirective} from 'primeng/button';
import {DatePipe} from '@angular/common';
import {Ripple} from 'primeng/ripple';
import {Vaccination} from '../../models/vaccination';


@Component({
  selector: 'app-vaccination-table',
  imports: [
    TableModule,
    DatePipe,
    ButtonDirective,
    Ripple,
  ],
  standalone: true,
  templateUrl: './vaccination-table.component.html',
  styleUrl: './vaccination-table.component.scss'
})


export class VaccinationTableComponent implements OnInit {
  http = inject(HttpClient)
  dogs: Dog[] = [];

  expandedRows: {[key: number]: boolean} = {};


  ngOnInit() {
    this.http.get<Dog[]>('http://localhost:8080/owner/3/dogs').subscribe({
      next: (dogs) => {
        this.dogs = dogs;
        console.log(dogs);
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });

  }


  expandAll() {
    this.expandedRows = this.dogs.reduce((acc: {[key: number]: boolean}, d: Dog) => {
      if (d && d.id !== undefined) {
        acc[d.id] = true; // d.id est un nombre, acc est typé pour accepter des clés numériques
      }
      return acc;
    }, {}); // L'objet initial pour reduce est {}, TypeScript l'utilisera avec le typage de this.expandedRows
  }


  collapseAll() {
    this.expandedRows = {};
  }
}

