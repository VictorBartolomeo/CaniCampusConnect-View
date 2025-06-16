// course.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8080';
  private http = inject(HttpClient);

  getCoursesForOwner(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/owner`);
  }

}
