import {Component, inject, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {HttpClient} from '@angular/common/http';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'app-course-card',
  imports: [MatCardModule, MatProgressBar],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss'
})
export class CourseCardComponent implements OnInit {
  http = inject(HttpClient);
  courses: Course[] = [];
  courseTypes: CourseType[] = [];
  isLoading: boolean = true;

  ngOnInit() {
    this.http.get<Course[]>('http://localhost:8080/courses').subscribe({
      next: (courses) => {
        this.courses = courses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
        this.isLoading = false;
      },
    });
  }
}
