import {Component, inject, OnInit} from '@angular/core';
import {CalendarEvent, CalendarMonthModule, CalendarMonthViewDay, CalendarView} from 'angular-calendar';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-calendar',
  imports: [
    CalendarMonthModule
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  http = inject(HttpClient);
  courses: Course[] = [];
  events: CalendarEvent<{ incrementsBadgeTotal: boolean }>[] = [];
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {
      day.badgeTotal = day.events.filter(
        (event) => event.meta.incrementsBadgeTotal
      ).length;
    });
  }

  ngOnInit() {
    this.http.get<Course[]>('http://localhost:8080/courses').subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log(courses);

        // Maintenant nous pouvons créer les événements une fois que les cours sont chargés
        this.events = this.courses.map(course => ({
          title: course.title,
          color: { primary: '#1e90ff', secondary: '#D1E8FF' }, // Définition de la couleur bleue
          start: new Date(course.startDatetime),
          meta: {
            incrementsBadgeTotal: true,
          },
        }));
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });
  }

}
