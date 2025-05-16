import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Card} from 'primeng/card';
import {Chip} from 'primeng/chip';
import {DatePipe} from '@angular/common';
import {Carousel} from 'primeng/carousel';
import {PrimeTemplate} from 'primeng/api';
import {Course} from '../../models/course';
import {Subscription} from 'rxjs';
import {DogService} from '../../service/dog.service';
import {Dog} from '../../models/dog';

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
  courses: Course[] = [];
  responsiveOptions: any[] | undefined;
  private subscription!: Subscription;
  private currentDogId: number | null = null;

  constructor(
    private http: HttpClient,
    private dogService: DogService
  ) {
  }

  ngOnInit() {
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      if (dog && dog.id !== this.currentDogId) {
        this.currentDogId = dog.id;
        this.loadCoursesForDog(dog.id);
      }
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadCoursesForDog(dogId: number) {
    // Chargez les détails du chien qui contiennent déjà les cours
    this.http.get<Dog>(`http://localhost:8080/dog/${dogId}`).subscribe({
      next: (dog) => {
        // Vérifiez si le chien a des courses associés
        if (dog.courses) {
          this.courses = dog.courses;
          console.log('Courses for dog:', this.courses);
        } else {
          this.courses = [];
          console.log('No courses available for this dog');
        }
      },
      error: (error) => {
        console.error(`Error fetching dog details ${dogId}:`, error);
      },
    });
  }
}

