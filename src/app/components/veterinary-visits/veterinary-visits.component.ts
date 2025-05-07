import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dog} from '../../models/dog';
import {Accordion, AccordionContent, AccordionHeader, AccordionPanel} from 'primeng/accordion';
import {DatePipe} from '@angular/common';
import {Paginator} from 'primeng/paginator';

@Component({
  selector: 'app-veterinary-visits',
  imports: [
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    DatePipe,
    Paginator
  ],
  templateUrl: './veterinary-visits.component.html',
  styleUrl: './veterinary-visits.component.scss'
})
export class VeterinaryVisitsComponent implements OnInit {
  http = inject(HttpClient);
  dogs: Dog[] = [];
  currentDog: Dog | null = null;

  // Pagination
  pageSize = 5;
  first = 0;
  totalVisits = 0;
  sortedVisits: any[] = [];
  paginatedVisits: any[] = [];

  ngOnInit() {
    this.http.get<Dog[]>('http://localhost:8080/owner/3/dogs').subscribe({
      next: (dogs) => {
        this.dogs = dogs;

        // Si au moins un chien existe, prendre le premier
        if (this.dogs.length > 0) {
          this.currentDog = this.dogs[0];

          // Trier les visites par date décroissante
          if (this.currentDog.veterinaryVisits && this.currentDog.veterinaryVisits.length > 0) {
            this.sortedVisits = [...this.currentDog.veterinaryVisits]
              .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

            this.totalVisits = this.sortedVisits.length;
            this.updatePaginatedVisits();
          }
        }

        console.log(dogs);
      },
      error: (error) => {
        console.error('Error fetching dogs:', error);
      },
    });
  }

  updatePaginatedVisits() {
    this.paginatedVisits = this.sortedVisits.slice(this.first, this.first + this.pageSize);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.updatePaginatedVisits();
  }
}
