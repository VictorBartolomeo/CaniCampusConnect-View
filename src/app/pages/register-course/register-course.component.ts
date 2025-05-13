import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableModule} from 'primeng/table';
import {ConfirmationService, FilterService, MessageService} from 'primeng/api';
import {InputTextModule} from 'primeng/inputtext';
import {CommonModule} from '@angular/common';
import {Course} from '../../models/course';
import {Dog} from '../../models/dog';
import {Toast} from 'primeng/toast';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faEye, faPaw} from '@fortawesome/free-solid-svg-icons';
import {Dialog} from 'primeng/dialog';
import {differenceInMonths} from 'date-fns';

@Component({
  selector: 'app-register-course',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    Toast,
    ConfirmPopupModule,
    FaIconComponent,
    Dialog,
  ],
  templateUrl: './register-course.component.html',
  styleUrl: './register-course.component.scss',
  providers: [ConfirmationService, MessageService, FilterService],
})
export class RegisterCourseComponent implements OnInit {
  http = inject(HttpClient);
  courses: Course[] = [];
  dogs: Dog[] = [];
  dialogVisible: boolean = false;
  selectedCourseForDialog: Course | null = null;
  selectedDog: Dog | null = null;
  filteredCourses: Course[] = [];

  ngOnInit() {
    this.http.get<Course[]>('http://localhost:8080/courses').subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log(courses);
        if (this.selectedDog) {
          this.filterCoursesForDog(this.selectedDog);
        }
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });

    this.http.get<Dog[]>('http://localhost:8080/owner/3/dogs').subscribe({
      next: (dogs) => {
        this.dogs = dogs;
        console.log(dogs);
        if (this.dogs.length > 0) {
          this.selectedDog = this.dogs[0];
          this.filterCoursesForDog(this.selectedDog);
        }
      },
      error: (error) => {
        console.error('Error fetching dogs:', error);
      },
    });
  }

  // Méthode pour filtrer les cours disponibles pour un chien en fonction de son âge
  filterCoursesForDog(dog: Dog) {
    if (!this.courses.length) {
      console.warn('Pas de cours disponibles pour filtrer');
      this.filteredCourses = [];
      return;
    }

    console.log(`Filtrage des cours pour ${dog.name}`);

    this.filteredCourses = this.courses.filter(course => {
      const eligible = this.isDogEligibleForCourse(dog, course);

      // Log pour débogage
      if (course.courseType && course.courseType.ageRange) {
        console.log(`Cours: ${course.title}, Éligible: ${eligible}`);
      }

      return eligible;
    });

    console.log(`Nombre de cours filtrés: ${this.filteredCourses.length}`);
  }

  isDogEligibleForCourse(dog: Dog, course: Course): boolean {
    // Vérifier que le cours a un type et une tranche d'âge
    if (!course.courseType || !course.courseType.ageRange) {
      return false;
    }

    const courseDate = new Date(course.startDatetime);
    const ageInMonths = differenceInMonths(courseDate, dog.birthDate);


    const minAgeInMonths = course.courseType.ageRange.minAge;
    const maxAgeInMonths = course.courseType.ageRange.maxAge;

    return ageInMonths >= minAgeInMonths && ageInMonths <= maxAgeInMonths;
  }

  // Permet de changer le chien sélectionné et de filtrer les cours en conséquence
  selectDog(dog: Dog) {
    this.selectedDog = dog;
    this.filterCoursesForDog(dog);
  }

  //POPUP CONFIRM
  constructor(private readonly confirmationService: ConfirmationService, private readonly messageService: MessageService) {
  }

  showCourseDialog(course: Course) {
    this.selectedCourseForDialog = course;
    this.dialogVisible = true;
  }

  confirm(course: Course, event: Event) {
    if (!this.selectedDog) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez sélectionner un chien',
        life: 1500,
      });
      return;
    }

    this.selectedCourseForDialog = course;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Inscrire ' + this.selectedDog.name + ' au cours de ' + course.title + ' ?',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        icon: 'pi pi-times',
        label: 'Annuler',
        outlined: true,
      },
      acceptButtonProps: {
        icon: 'pi pi-check',
        label: 'Confirmer',
      },

      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmé !',
          detail: 'Votre demande d\'inscription a bien été envoyée',
          life: 1500,
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Annulé !',
          detail: 'Action annulée',
          life: 1500,
        });
      },
    });
  }

  getDogAgeCategory(dog: Dog): string {
    const ageInMonths = differenceInMonths(new Date(), dog.birthDate);
    if (ageInMonths >= 0 && ageInMonths <= 12) {
      return "Chiot";
    } else if (ageInMonths >= 13 && ageInMonths <= 36) {
      return "Jeune chien";
    } else if (ageInMonths >= 37 && ageInMonths <= 84) {
      return "Adulte";
    } else if (ageInMonths >= 85) {
      return "Senior";
    } else {
      return "Âge inconnu";
    }
  }



  //MODALE
  visible: boolean = false;

  protected readonly faPaw = faPaw;
  protected readonly faEye = faEye;
}
