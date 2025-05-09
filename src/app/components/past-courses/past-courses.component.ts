import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {Calendar} from 'primeng/calendar';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-past-courses',
  imports: [
    TableModule,
    DatePipe,
    CurrencyPipe,
    Calendar,
    FormsModule
  ],
  templateUrl: './past-courses.component.html',
  styleUrl: './past-courses.component.scss'
})
export class PastCoursesComponent implements OnInit {
  http = inject(HttpClient);
  courses: Course[] = [];
  pastCourses: Course[] = [];
  filterDate: Date= new Date();


  ngOnInit() {
    this.http.get<Course[]>('http://localhost:8080/courses').subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log(courses);
        // Filtrer les cours passés dès que les données sont chargées
        this.filterPastCourses();
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });
  }

  filterPastCourses() {
    const today = new Date();

    // Filtrer les cours dont la date est passée
    this.pastCourses = this.courses
      .filter(course => {
        const courseDate = new Date(course.startDatetime);
        return courseDate < today;
      })
      .sort((a, b) => new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime()); // Du plus récent au plus ancien
  }

  onDateSelect() {
    if (this.filterDate) {
      const selectedDate = new Date(this.filterDate);

      // Filtrer les cours antérieurs à la date sélectionnée
      this.pastCourses = this.courses
        .filter(course => {
          const courseDate = new Date(course.startDatetime);
          return courseDate < selectedDate;
        })
        .sort((a, b) => new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime());
    } else {
      this.filterPastCourses(); // Réinitialiser au filtre par défaut
    }
  }
}

