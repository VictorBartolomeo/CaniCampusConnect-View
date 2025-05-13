import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Card} from 'primeng/card';
import {Chip} from 'primeng/chip';
import {DatePipe} from '@angular/common';
import {Carousel} from 'primeng/carousel';
import {PrimeTemplate} from 'primeng/api';
import {Course} from '../../models/course';

@Component({
  selector: 'app-course-card',
  imports: [
    Card,
    Chip,
    DatePipe,
    Carousel,
    PrimeTemplate
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent implements OnInit {
  http = inject(HttpClient);
  courses: Course[] = [];
  responsiveOptions: any[] | undefined;

  ngOnInit() {
    this.http.get<Course[]>('http://localhost:8080/courses').subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log(courses);
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
      }
    ]
  }
}
