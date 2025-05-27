import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Card} from 'primeng/card';
import {Chip} from 'primeng/chip';
import {DatePipe, NgClass} from '@angular/common';
import {Carousel} from 'primeng/carousel';
import {Course} from '../../../models/course';
import {Subscription} from 'rxjs';
import {DogService} from '../../../service/dog.service';
import {Dog} from '../../../models/dog';
import {PrimeTemplate} from 'primeng/api';
import {Registration} from '../../../models/registration';
import {RegistrationStatus} from '../../../models/registrationstatus.enum';


@Component({
  selector: 'app-course-card',
  imports: [
    Card,
    Chip,
    DatePipe,
    Carousel,
    NgClass,
    PrimeTemplate
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent implements OnInit {

  registrations: Registration[] = [];
  responsiveOptions: any[] | undefined;
  activeDog: Dog | null = null;
  private subscription!: Subscription;
  private currentDogId: number | null = null;

  constructor(
    private dogService: DogService
  ) {}

  ngOnInit() {
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      if (dog && dog.id !== this.currentDogId) {
        this.currentDogId = dog.id;
        this.loadRegistrationsForDog(dog);
      } else if (!dog) {
        this.registrations = [];
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

  loadRegistrationsForDog(dog: Dog) {
    if (dog.registrations && dog.registrations.length > 0) {
      // Récupérer la date actuelle
      const currentDate = new Date();

      // Filtrer uniquement les cours à venir
      this.registrations = dog.registrations
        .filter(registration => {
          const courseStartDate = new Date(registration.course.startDatetime);
          return courseStartDate >= currentDate;
        })
        .sort((a, b) => {
          const dateA = new Date(a.course.startDatetime).getTime();
          const dateB = new Date(b.course.startDatetime).getTime();
          return dateA - dateB;
        })

      console.log('Inscriptions aux cours à venir pour le chien (triées par date):', this.registrations);
    } else {
      this.registrations = [];
      console.log('Aucune inscription aux cours disponible pour ce chien');
    }
  }



  getStatusClass(status: RegistrationStatus | null): string {
    if (!status) return 'status-unknown';

    switch(status) {
      case RegistrationStatus.CONFIRMED:
        return 'status-confirmed';
      case RegistrationStatus.PENDING:
        return 'status-pending';
      case RegistrationStatus.CANCELLED:
        return 'status-canceled';
      case RegistrationStatus.REFUSED:
        return 'status-refused';
      default:
        return 'status-unknown';
    }
  }

  getStatusLabel(status: RegistrationStatus | null): string {
    if (!status) return 'Non défini';

    switch(status) {
      case RegistrationStatus.CONFIRMED:
        return 'CONFIRMÉ';
      case RegistrationStatus.PENDING:
        return 'EN ATTENTE';
      case RegistrationStatus.CANCELLED:
        return 'ANNULÉ';
      case RegistrationStatus.REFUSED:
        return 'REFUSÉ';
      default:
        return 'INCONNU';
    }
  }
  getStatusIcon(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'pi pi-check-circle'; // Icône de cercle avec une coche
      case 'PENDING':
        return 'pi pi-clock'; // Icône d'horloge
      case 'CANCELLED':
        return 'pi pi-times-circle'; // Icône de cercle avec une croix
      default:
        return 'pi pi-question-circle'; // Icône de cercle avec un point d'interrogation
    }
  }


}

