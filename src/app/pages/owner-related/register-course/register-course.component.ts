import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfirmationService, FilterService, MessageService} from 'primeng/api';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {Toast} from 'primeng/toast';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {Dialog} from 'primeng/dialog';
import {differenceInMonths, isAfter, startOfDay} from 'date-fns';
import {AgeRangeCategory, getAgeRangeCategory} from '../../../models/age-range-category.enum';
import {DogService} from '../../../service/dog.service';
import {RegistrationService} from '../../../service/registration.service';
import {CourseService} from '../../../service/course.service';
import {Dog} from '../../../models/dog';
import {Course} from '../../../models/course';
import {RegistrationStatus} from '../../../models/registrationstatus.enum';
import {ButtonDirective, ButtonIcon, ButtonLabel} from 'primeng/button';
import {ActiveRegistrationsPipe} from '../../../Pipes/active-registrations.pipe';
import {Card} from 'primeng/card';
import {RouterLink} from '@angular/router';
import {AccordionModule} from 'primeng/accordion';

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
    RouterLink,
    ButtonIcon,
    ButtonLabel,
    AccordionModule,
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

  courses: Course[] = [];
  dialogVisible: boolean = false;
  selectedCourseForDialog: Course | null = null;
  selectedDog: Dog | null = null;
  filteredCourses: Course[] = [];

  ngOnInit() {
    this.dogService.activeDog$.subscribe(activeDog => {
      if (activeDog) {
        this.selectedDog = activeDog;
        this.loadAvailableCourses();
      }
    });
    this.dogService.loadUserDogs();
  }

  loadAvailableCourses() {
    if (!this.selectedDog) return;

    this.courseService.getUpcomingCourses().subscribe({
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
    this.filteredCourses = this.courses.filter(course => {
      const isAlreadyRegistered = this.isDogRegisteredForCourse(course);
      if (isAlreadyRegistered) {
        return false;
      }
      const isEligibleByAge = this.isDogEligibleForCourse(this.selectedDog!, course);
      if (!isEligibleByAge) {
        return false;
      }
      const activeRegistrations = course.registrations ?
        course.registrations.filter(r =>
          r.status === RegistrationStatus.PENDING ||
          r.status === RegistrationStatus.CONFIRMED
        ).length : 0;
      const isFull = activeRegistrations >= course.maxCapacity;
      return !isFull;

    });
    this.filteredCourses.sort((a, b) => {
      const dateA = new Date(a.startDatetime).getTime();
      const dateB = new Date(b.startDatetime).getTime();
      return dateA - dateB;
    });
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
        this.messageService.add({
          severity: 'success',
          summary: 'Inscription réussie!',
          detail: `${dog.name} a été inscrit au cours "${course.title}"`,
          life: 3000,
        });

        this.loadAvailableCourses();
      },
      error: (error: any) => {
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
