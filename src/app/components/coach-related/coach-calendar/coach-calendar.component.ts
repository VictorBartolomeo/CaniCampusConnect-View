// coach-calendar.component.ts
import {Component, inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule, UpperCasePipe} from '@angular/common';
import {
  CalendarCommonModule,
  CalendarDateFormatter,
  CalendarEvent,
  CalendarMonthModule,
  CalendarView,
  DAYS_OF_WEEK
} from 'angular-calendar';
import {Subject, Subscription} from 'rxjs';
import {addMonths} from 'date-fns';
import {ButtonModule} from 'primeng/button';

import {CoachDataService} from '../../../service/coach-data.service';
import {AuthStateService} from '../../../service/auth-state.service';
import {AuthService} from '../../../service/auth.service';
import {Course} from '../../../models/course';
import {CustomDateFormatter} from '../../owner-related/calendar/custom-date-formatter.provider';

interface CoachCalendarEvent extends CalendarEvent {
  course: Course;
}

@Component({
  selector: 'app-coach-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarMonthModule,
    CalendarCommonModule,
    ButtonModule,
    UpperCasePipe
  ],
  templateUrl: './coach-calendar.component.html',
  styleUrls: ['./coach-calendar.component.scss'],
  providers: [{provide: CalendarDateFormatter, useClass: CustomDateFormatter}],
  encapsulation: ViewEncapsulation.None,
})
export class CoachCalendarComponent implements OnInit, OnDestroy {
  private authStateService = inject(AuthStateService);
  private coachDataService = inject(CoachDataService);
  public authService = inject(AuthService);

  coachId: number | null = null;

  view: CalendarView = CalendarView.Month;
  viewDate = new Date();
  events: CoachCalendarEvent[] = [];
  activeDayIsOpen: boolean = false;
  locale: string = 'fr';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];

  refresh = new Subject<void>();
  isLoading = true;
  error: string | null = null;

  private readonly darkThemeClass = 'dark-theme';
  private coursesSubscription?: Subscription;

  ngOnInit() {
    this.coachId = this.authStateService.getUserId();
    if (this.coachId) {
      this.loadCoachCourses();
    } else {
      this.error = "Impossible de récupérer l'identifiant du coach.";
      this.isLoading = false;
    }
  }

  loadCoachCourses() {
    this.isLoading = true;
    this.coursesSubscription = this.coachDataService.getCoursesByCoachId(this.coachId!)
      .subscribe({
        next: (courses) => {
          console.log('Cours du coach chargés:', courses.length);
          this.events = this.createCalendarEvents(courses);
          this.isLoading = false;
          this.refresh.next();
        },
        error: (err) => {
          console.error("Erreur lors du chargement des cours du coach:", err);
          this.error = "Erreur lors du chargement des cours.";
          this.isLoading = false;
        }
      });
  }

  createCalendarEvents(courses: Course[]): CoachCalendarEvent[] {
    return courses.map(course => {
      const startDate = new Date(course.startDatetime);

      return {
        title: `${course.title}`,
        start: startDate,
        end: new Date(course.endDatetime),
        color: this.getEventColor(course.registrations?.length || 0, course.maxCapacity),
        course: course,
        allDay: false,
        meta: {
          startTime: startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(course.endDatetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          registrations: course.registrations?.length || 0,
          capacity: course.maxCapacity,
          type: course.courseType?.name || 'Non spécifié'
        }
      };
    });
  }

  getEventColor(registrations: number, capacity: number): { primary: string; secondary: string } {
    const ratio = capacity > 0 ? registrations / capacity : 0;

    if (this.authService.isDarkMode()) {
      // Mode sombre
      if (ratio >= 0.8) {
        return { primary: '#5CCA62', secondary: '#255D2A' }; // Vert plus lumineux
      } else if (ratio >= 0.5) {
        return { primary: '#FFD54F', secondary: '#5D4C10' }; // Jaune plus lumineux
      } else if (ratio > 0) {
        return { primary: '#42A5F5', secondary: '#1A3D5D' }; // Bleu plus lumineux
      } else {
        return { primary: '#FF5252', secondary: '#5D1F1F' }; // Rouge plus lumineux (aucune inscription)
      }
    } else {
      // Mode clair
      if (ratio >= 0.8) {
        return { primary: '#4CAF50', secondary: '#E8F5E9' }; // Vert
      } else if (ratio >= 0.5) {
        return { primary: '#FFC107', secondary: '#FFF8E1' }; // Jaune/Orange
      } else if (ratio > 0) {
        return { primary: '#1e90ff', secondary: '#D1E8FF' }; // Bleu
      } else {
        return { primary: '#F44336', secondary: '#FFEBEE' }; // Rouge (aucune inscription)
      }
    }
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (events.length === 0) {
      this.activeDayIsOpen = false;
      return;
    }

    this.activeDayIsOpen = true;
    this.viewDate = date;
  }

  eventClicked(event: { event: CalendarEvent }): void {
    console.log('Cours sélectionné:', (event.event as CoachCalendarEvent).course);
    // Vous pouvez ajouter ici une logique pour afficher les détails du cours
  }

  navigatePrevious(): void {
    this.viewDate = addMonths(this.viewDate, -1);
    this.activeDayIsOpen = false;
  }

  navigateToday(): void {
    this.viewDate = new Date();
    this.activeDayIsOpen = false;
  }

  navigateNext(): void {
    this.viewDate = addMonths(this.viewDate, 1);
    this.activeDayIsOpen = false;
  }

  ngOnDestroy() {
    if (this.coursesSubscription) {
      this.coursesSubscription.unsubscribe();
    }
  }
}
