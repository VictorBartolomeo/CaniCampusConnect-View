
import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ConfirmationService, FilterService, MessageService} from 'primeng/api';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {Toast} from 'primeng/toast';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {Dialog} from 'primeng/dialog';
import {faEye, faPaw} from '@fortawesome/free-solid-svg-icons';
import {differenceInMonths, isAfter, startOfDay} from 'date-fns';
import {AgeRangeCategory, getAgeRangeCategory} from '../../../models/age-range-category.enum';

import {DogService} from '../../../service/dog.service';
import {RegistrationService} from '../../../service/registration.service';
import {CourseService} from '../../../service/course.service';
import {Dog} from '../../../models/dog';
import {Course} from '../../../models/course';
import {RegistrationStatus} from '../../../models/registrationstatus.enum';
import {ButtonDirective} from 'primeng/button';
import {ActiveRegistrationsPipe} from '../../../Pipes/active-registrations.pipe';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-register-course',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    Toast,
    ConfirmPopupModule,
    Dialog,
    ButtonDirective,
    ActiveRegistrationsPipe,
    Card,
  ],
  templateUrl: './register-course.component.html',
  styleUrl: './register-course.component.scss',
  providers: [ConfirmationService, MessageService, FilterService],
})
export class RegisterCourseComponent implements OnInit {
  dogService = inject(DogService);
  registrationService = inject(RegistrationService);
  courseService = inject(CourseService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  filterService = inject(FilterService);

  courses: Course[] = [];
  dialogVisible: boolean = false;
  selectedCourseForDialog: Course | null = null;
  selectedDog: Dog | null = null;
  filteredCourses: Course[] = [];

  // Les icônes pour les boutons
  protected readonly faEye = faEye;
  protected readonly faPaw = faPaw;

  ngOnInit() {
    this.dogService.activeDog$.subscribe(activeDog => {
      if (activeDog) {
        this.selectedDog = activeDog;
        console.log('Chien actif:', this.selectedDog);
        this.loadAvailableCourses();
      }
    });

    // S'assurer que les chiens sont chargés
    this.dogService.loadUserDogs();
  }

  loadAvailableCourses() {
    if (!this.selectedDog) return;

    this.courseService.getCoursesForOwner().subscribe({
      next: (courses: Course[]) => {
        console.log('Cours chargés avec inscriptions:', courses);
        this.courses = courses;
        this.filterCoursesForDog();
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des cours:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les cours disponibles',
          life: 3000,
        });
      }
    });
  }

  filterCoursesForDog() {
    if (!this.selectedDog || !this.courses.length) {
      this.filteredCourses = [];
      return;
    }

    const today = startOfDay(new Date());

    this.filteredCourses = this.courses.filter(course => {
      const courseDate = new Date(course.startDatetime);
      const isFutureCourse = isAfter(courseDate, today) ||
        courseDate.getTime() === today.getTime();

      if (!isFutureCourse) {
        console.log(`Cours "${course.title}": dans le passé (${courseDate.toLocaleDateString()})`);
        return false;
      }

      const isAlreadyRegistered = this.isDogRegisteredForCourse(course);
      if (isAlreadyRegistered) {
        console.log(`Cours "${course.title}": chien déjà inscrit`);
        return false;
      }

      const isEligibleByAge = this.isDogEligibleForCourse(this.selectedDog!, course);
      if (!isEligibleByAge) {
        console.log(`Cours "${course.title}": chien non éligible par âge`);
        return false;
      }

      const activeRegistrations = course.registrations ?
        course.registrations.filter(r =>
          r.status === RegistrationStatus.PENDING ||
          r.status === RegistrationStatus.CONFIRMED
        ).length : 0;

      const isFull = activeRegistrations >= course.maxCapacity;
      if (isFull) {
        console.log(`Cours "${course.title}": complet (${activeRegistrations}/${course.maxCapacity})`);
        return false;
      }

      console.log(`Cours "${course.title}": disponible pour inscription (${courseDate.toLocaleDateString()})`);
      return true;
    });

    this.filteredCourses.sort((a, b) => {
      const dateA = new Date(a.startDatetime).getTime();
      const dateB = new Date(b.startDatetime).getTime();
      return dateA - dateB;
    });

    console.log(`📅 ${this.filteredCourses.length} cours à venir disponibles pour ${this.selectedDog?.name}`);
  }

  isDogRegisteredForCourse(course: Course): boolean {
    if (!course.registrations || !this.selectedDog) return false;

    return course.registrations.some(registration =>
      registration.dog &&
      registration.dog.id === this.selectedDog!.id &&
      (registration.status === RegistrationStatus.PENDING ||
        registration.status === RegistrationStatus.CONFIRMED)
    );
  }

  getDogAgeCategory(dog: Dog): string {
    const dogBirthDate = new Date(dog.birthDate);
    const ageInMonths = differenceInMonths(new Date(), dogBirthDate);

    if (ageInMonths >= 0 && ageInMonths <= 12) {
      return AgeRangeCategory.PUPPY;
    } else if (ageInMonths >= 13 && ageInMonths <= 36) {
      return AgeRangeCategory.YOUNG_DOG;
    } else if (ageInMonths >= 37 && ageInMonths <= 84) {
      return AgeRangeCategory.ADULT;
    } else if (ageInMonths >= 85) {
      return AgeRangeCategory.SENIOR;
    } else {
      return "Âge inconnu";
    }
  }

  getCourseAgeRangeCategory(course: Course): string {
    if (!course || !course.courseType || !course.courseType.ageRange) {
      return "Toutes catégories";
    }

    const minAge = course.courseType.ageRange.minAge;
    const maxAge = course.courseType.ageRange.maxAge;

    return getAgeRangeCategory(minAge, maxAge);
  }

  isDogEligibleForCourse(dog: Dog, course: Course): boolean {
    const courseDate = new Date(course.startDatetime);
    const dogBirthDate = new Date(dog.birthDate);
    const ageInMonths = differenceInMonths(courseDate, dogBirthDate);

    const minAge = course.courseType.ageRange.minAge || 0;
    const maxAge = course.courseType.ageRange.maxAge || 240;

    const isEligible = ageInMonths >= minAge && ageInMonths <= maxAge;

    console.log(`Chien ${dog.name} (${ageInMonths} mois à la date du cours) est ${isEligible ? 'éligible' : 'non éligible'} pour le cours "${course.title}" (âge requis: ${minAge}-${maxAge} mois)`);

    return isEligible;
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
        this.registerDogForCourse(this.selectedDog!, course);
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

  registerDogForCourse(dog: Dog, course: Course) {
    if (!dog || !dog.id || !course || !course.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Informations invalides pour l\'inscription',
        life: 3000,
      });
      return;
    }

    this.registrationService.createRegistration(dog.id, course.id).subscribe({
      next: (response) => {
        console.log('Inscription réussie:', response);

        this.messageService.add({
          severity: 'success',
          summary: 'Inscription réussie!',
          detail: `${dog.name} a été inscrit au cours "${course.title}"`,
          life: 3000,
        });

        this.loadAvailableCourses();
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'inscription:', error);

        const errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'inscription';
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur d\'inscription',
          detail: errorMessage,
          life: 3000,
        });
      }
    });
  }
}
