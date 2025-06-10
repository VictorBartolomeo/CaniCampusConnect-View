import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ConfirmationService, FilterService, MessageService} from 'primeng/api';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {Toast} from 'primeng/toast';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {Dialog} from 'primeng/dialog';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faEye, faPaw} from '@fortawesome/free-solid-svg-icons';
import {differenceInMonths, isAfter, startOfDay} from 'date-fns'; // ✅ Ajouter isAfter et startOfDay

import {DogService} from '../../../service/dog.service';
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
    FaIconComponent,
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
  http = inject(HttpClient);
  dogService = inject(DogService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  filterService = inject(FilterService);

  courses: Course[] = [];
  dialogVisible: boolean = false;
  selectedCourseForDialog: Course | null = null;
  selectedDog: Dog | null = null;
  filteredCourses: Course[] = [];
  apiUrl = 'http://localhost:8080';

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

    // Utiliser la nouvelle route pour récupérer les cours avec leurs inscriptions
    this.http.get<Course[]>(`${this.apiUrl}/courses/owner`).subscribe({
      next: (courses) => {
        console.log('Cours chargés avec inscriptions:', courses);
        this.courses = courses;

        // Filtrer les cours disponibles pour ce chien
        this.filterCoursesForDog();
      },
      error: (error) => {
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

    // ✅ Date d'aujourd'hui (début de journée) pour comparaison
    const today = startOfDay(new Date());

    // Filtrer les cours pour le chien actif
    this.filteredCourses = this.courses.filter(course => {
      // ✅ 1. Vérifier que le cours est à venir (pas dans le passé)
      const courseDate = new Date(course.startDatetime);
      const isFutureCourse = isAfter(courseDate, today) ||
        courseDate.getTime() === today.getTime(); // Inclure les cours d'aujourd'hui

      if (!isFutureCourse) {
        console.log(`Cours "${course.title}": dans le passé (${courseDate.toLocaleDateString()})`);
        return false;
      }

      // ✅ 2. Vérifier si le chien est déjà inscrit à ce cours
      const isAlreadyRegistered = this.isDogRegisteredForCourse(course);
      if (isAlreadyRegistered) {
        console.log(`Cours "${course.title}": chien déjà inscrit`);
        return false;
      }

      // ✅ 3. Vérifier si le chien est éligible par âge
      const isEligibleByAge = this.isDogEligibleForCourse(this.selectedDog!, course);
      if (!isEligibleByAge) {
        console.log(`Cours "${course.title}": chien non éligible par âge`);
        return false;
      }

      // ✅ 4. Vérifier si le cours est complet
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

    // ✅ Trier les cours par date (du plus proche au plus lointain)
    this.filteredCourses.sort((a, b) => {
      const dateA = new Date(a.startDatetime).getTime();
      const dateB = new Date(b.startDatetime).getTime();
      return dateA - dateB;
    });

    console.log(`📅 ${this.filteredCourses.length} cours à venir disponibles pour ${this.selectedDog?.name}`);
  }

  // ✅ Méthode utilitaire pour vérifier si un cours est à venir
  private isFutureCourse(course: Course): boolean {
    const today = startOfDay(new Date());
    const courseDate = new Date(course.startDatetime);
    return isAfter(courseDate, today) || courseDate.getTime() === today.getTime();
  }

  // Vérifier si le chien est déjà inscrit à un cours
  isDogRegisteredForCourse(course: Course): boolean {
    if (!course.registrations || !this.selectedDog) return false;

    return course.registrations.some(registration =>
      registration.dog &&
      registration.dog.id === this.selectedDog!.id &&
      (registration.status === RegistrationStatus.PENDING ||
        registration.status === RegistrationStatus.CONFIRMED)
    );
  }

  // Obtenir la catégorie d'âge du chien (pour l'affichage)
  getDogAgeCategory(dog: Dog): string {
    const dogBirthDate = new Date(dog.birthDate);
    const ageInMonths = differenceInMonths(new Date(), dogBirthDate);

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

  isDogEligibleForCourse(dog: Dog, course: Course): boolean {
    // Calculer l'âge du chien À LA DATE DU COURS
    const courseDate = new Date(course.startDatetime);
    const dogBirthDate = new Date(dog.birthDate);
    const ageInMonths = differenceInMonths(courseDate, dogBirthDate);

    // Obtenir les limites d'âge du cours
    const minAge = course.courseType.ageRange.minAge || 0;
    const maxAge = course.courseType.ageRange.maxAge || 240; // 20 ans par défaut

    // Vérifier si l'âge est dans la plage
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

    // Créer un objet pour la requête d'inscription
    const registrationData = {
      dog: { id: dog.id },
      course: { id: course.id }
    };

    // Envoyer la demande d'inscription
    this.http.post(`${this.apiUrl}/registration`, registrationData).subscribe({
      next: (response) => {
        console.log('Inscription réussie:', response);

        this.messageService.add({
          severity: 'success',
          summary: 'Inscription réussie!',
          detail: `${dog.name} a été inscrit au cours "${course.title}"`,
          life: 3000,
        });

        // Mettre à jour la liste des cours disponibles
        this.loadAvailableCourses();
      },
      error: (error) => {
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
