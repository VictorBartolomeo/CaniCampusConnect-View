import {Component, inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {
  CalendarCommonModule,
  CalendarDateFormatter,
  CalendarDayModule,
  CalendarEvent,
  CalendarMonthModule,
  CalendarView,
  CalendarWeekModule,
  DAYS_OF_WEEK
} from 'angular-calendar';
import {HttpClient} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {Course} from '../../../models/course';
import {CustomDateFormatter} from './custom-date-formatter.provider';
import {Button} from 'primeng/button';
import {DOCUMENT, UpperCasePipe} from '@angular/common';
import {DogService} from '../../../service/dog.service';
import {Dog} from '../../../models/dog';
import {Registration} from '../../../models/registration';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../service/auth.service';

@Component({
  selector: 'app-calendar',
  imports: [
    CalendarMonthModule,
    TableModule,
    CalendarCommonModule,
    CalendarWeekModule,
    CalendarDayModule,
    Button,
    UpperCasePipe
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  providers: [{provide: CalendarDateFormatter, useClass: CustomDateFormatter}],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarComponent implements OnInit, OnDestroy {
  http = inject(HttpClient);
  dogService = inject(DogService);
  authService = inject(AuthService);
  activeDog: Dog | null = null;
  registrations: Registration[] = [];
  subscription: Subscription | null = null;
  document = inject(DOCUMENT);

  view: CalendarView = CalendarView.Month;
  viewDate = new Date();
  events: CalendarEvent[] = [];
  locale: string = 'fr';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.FRIDAY, DAYS_OF_WEEK.SATURDAY];

  private readonly darkThemeClass = 'dark-theme';

  ngOnInit() {
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      this.activeDog = dog;
      if (dog) {
        this.loadRegistrationsForDog(dog);
      } else {
        this.registrations = [];
        this.events = [];
      }
    });

    this.document.body.classList.add(this.darkThemeClass);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadRegistrationsForDog(dog: Dog) {
    if (dog.registrations && dog.registrations.length > 0) {
      this.registrations = dog.registrations;
      console.log('Inscriptions aux cours pour le chien dans le calendrier:', this.registrations);

      this.events = this.registrations.map(registration => {
        const startDate = new Date(registration.course.startDatetime);

        return {
          title: `${registration.course.title} - ${registration.status}`,
          color: this.getEventColor(registration.status),
          start: startDate,
          allDay: false,
          meta: {
            registration: registration,
            startTime: startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(registration.course.endDatetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          }
        };
      });
    } else {
      this.registrations = [];
      this.events = [];
      console.log('Aucune inscription aux cours disponible pour ce chien dans le calendrier');
    }
  }


  getEventColor(status: string): { primary: string; secondary: string } {
    // Ajuster les couleurs en fonction du mode sombre ou clair
    if (this.authService.isDarkMode()) {
      // Couleurs pour le mode sombre
      switch (status) {
        case 'CONFIRMED':
          return { primary: '#5CCA62', secondary: '#255D2A' }; // Vert plus lumineux en mode sombre
        case 'PENDING':
          return { primary: '#FFD54F', secondary: '#5D4C10' }; // Jaune plus lumineux
        case 'CANCELLED':
          return { primary: '#FF5252', secondary: '#5D1F1F' }; // Rouge plus lumineux
        default:
          return { primary: '#42A5F5', secondary: '#1A3D5D' }; // Bleu plus lumineux
      }
    } else {
      // Couleurs pour le mode clair (vos couleurs actuelles)
      switch (status) {
        case 'CONFIRMED':
          return { primary: '#4CAF50', secondary: '#E8F5E9' }; // Vert
        case 'PENDING':
          return { primary: '#FFC107', secondary: '#FFF8E1' }; // Jaune/Orange
        case 'CANCELLED':
          return { primary: '#F44336', secondary: '#FFEBEE' }; // Rouge
        default:
          return { primary: '#1e90ff', secondary: '#D1E8FF' }; // Bleu par défaut
      }
    }
  }
}
