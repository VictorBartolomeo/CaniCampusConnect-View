import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Course} from '../../../models/course';
import {Calendar} from 'primeng/calendar';
import {Dog} from '../../../models/dog';
import {Registration} from '../../../models/registration';
import {Subscription} from 'rxjs';
import {DogService} from '../../../service/dog.service';
import {ButtonDirective, ButtonIcon} from 'primeng/button';
import {DatePicker} from 'primeng/datepicker';


@Component({
  selector: 'app-past-courses',
  imports: [
    TableModule,
    DatePipe,
    FormsModule,
    Calendar,
    ButtonDirective,
    ButtonIcon,
    DatePicker
  ],
  templateUrl: './past-courses.component.html',
  styleUrl: './past-courses.component.scss'
})
export class PastCoursesComponent implements OnInit, OnDestroy {

  activeDog: Dog | null = null;
  pastRegistrations: Registration[] = [];
  filteredRegistrations: Registration[] = [];
  dateFilter: Date | null = null;
  private subscription: Subscription | null = null;

  constructor(private dogService: DogService) {
  }

  ngOnInit() {
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      this.activeDog = dog;
      if (dog) {
        this.loadPastCoursesForDog(dog);
      } else {
        this.pastRegistrations = [];
        this.filteredRegistrations = [];
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadPastCoursesForDog(dog: Dog) {
    if (dog.registrations && dog.registrations.length > 0) {
      const currentDate = new Date();

      // Filtrer les inscriptions dont la date est passée
      this.pastRegistrations = dog.registrations
        .filter(registration => {
          const courseEndDate = new Date(registration.course.endDatetime);
          return courseEndDate < currentDate;
        })
        .sort((a, b) => {
          // Tri par date décroissante (du plus récent au plus ancien)
          const dateA = new Date(a.course.startDatetime).getTime();
          const dateB = new Date(b.course.startDatetime).getTime();
          return dateB - dateA;
        });

      // Initialiser les résultats filtrés avec tous les cours passés
      this.filteredRegistrations = [...this.pastRegistrations];

      console.log('Cours passés pour le chien:', this.pastRegistrations);
    } else {
      this.pastRegistrations = [];
      this.filteredRegistrations = [];
      console.log('Aucun cours passé disponible pour ce chien');
    }
  }

  onDateFilterChange() {
    if (!this.dateFilter) {
      // Si aucune date n'est sélectionnée, afficher tous les cours passés
      this.filteredRegistrations = [...this.pastRegistrations];
    } else {
      // Filtrer les cours passés à partir de la date sélectionnée
      this.filteredRegistrations = this.pastRegistrations.filter(registration => {
        const courseDate = new Date(registration.course.startDatetime);
        return courseDate >= this.dateFilter!;
      });
    }
  }

  clearDateFilter() {
    this.dateFilter = null;
    this.filteredRegistrations = [...this.pastRegistrations];
  }
}
