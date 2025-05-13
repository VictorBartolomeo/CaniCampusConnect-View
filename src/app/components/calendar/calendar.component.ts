import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {
  CalendarCommonModule, CalendarDateFormatter, CalendarDayModule,
  CalendarEvent,
  CalendarMonthModule,
  CalendarMonthViewDay,
  CalendarView, CalendarWeekModule, DAYS_OF_WEEK
} from 'angular-calendar';
import {HttpClient} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {Course} from '../../models/course';
import {NgSwitch, NgSwitchCase} from '@angular/common';
import {CustomDateFormatter} from './custom-date-formatter.provider';

@Component({
  selector: 'app-calendar',
  imports: [
    CalendarMonthModule,
    TableModule,
    CalendarCommonModule,
    NgSwitch,
    CalendarWeekModule,
    CalendarDayModule,
    NgSwitchCase
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  providers: [{provide: CalendarDateFormatter, useClass: CustomDateFormatter}],
})
export class CalendarComponent implements OnInit {
  http = inject(HttpClient);
  courses: Course[] = [];



  ngOnInit() {
    this.http.get<Course[]>('http://localhost:8080/courses').subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log(courses);

        this.events = this.courses.map(course => ({
          title: course.title,
          color: {primary: '#1e90ff', secondary: '#D1E8FF'}, // Définition de la couleur bleue
          start: new Date(course.startDatetime),
          end: new Date(course.endDatetime),
        }));

      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });
  }
  view: CalendarView = CalendarView.Month;
  viewDate = new Date();
  events: CalendarEvent[] = [];
  locale: string = 'fr';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.FRIDAY, DAYS_OF_WEEK.SATURDAY];

}
