import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Dog} from '../../models/dog';
import {Accordion, AccordionContent, AccordionHeader, AccordionPanel} from 'primeng/accordion';
import {DatePipe} from '@angular/common';
import {Paginator} from 'primeng/paginator';
import {Subscription} from 'rxjs';
import {DogService} from '../../service/dog.service';

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
  currentDog: Dog | null = null;
  private subscription!: Subscription;

  constructor(private dogService: DogService) {}


  // Pagination
  pageSize = 5;
  first = 0;
  totalVisits = 0;
  sortedVisits: any[] = [];
  paginatedVisits: any[] = [];

  ngOnInit() {
    // S'abonner aux changements du chien actif
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      this.currentDog = dog;

      if (dog && dog.veterinaryVisits) {
        // Trier les visites par date décroissante
        this.sortedVisits = [...dog.veterinaryVisits]
          .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

        this.totalVisits = this.sortedVisits.length;
        this.updatePaginatedVisits();
        console.log('Visites vétérinaires mises à jour:', this.sortedVisits);
      } else {
        this.sortedVisits = [];
        this.paginatedVisits = [];
        this.totalVisits = 0;
      }
    });
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  updatePaginatedVisits() {
    this.paginatedVisits = this.sortedVisits.slice(this.first, this.first + this.pageSize);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.updatePaginatedVisits();
  }
}
