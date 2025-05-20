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
import {differenceInMonths} from 'date-fns';
import {forkJoin} from 'rxjs';

import {DogService} from '../../service/dog.service';
import {Dog} from '../../models/dog';
import {Course} from '../../models/course';
import {Registration} from '../../models/registration';
import {RegistrationStatus} from '../../models/registrationstatus.enum';
import {ButtonDirective} from 'primeng/button';

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
  dogRegistrations: Registration[] = [];
  dogs: Dog[] = [];
  dialogVisible: boolean = false;
  selectedCourseForDialog: Course | null = null;
  selectedDog: Dog | null = null;
  filteredCourses: Course[] = [];
  apiUrl = 'http://localhost:8080';

  ngOnInit() {
    // Récupérer d'abord le chien actif
    this.dogService.activeDog$.subscribe(activeDog => {
      if (activeDog) {
        this.selectedDog = activeDog;
        console.log('Chien actif:', this.selectedDog);

        // Une fois qu'on a le chien actif, charger à la fois les cours et les inscriptions
        this.loadCoursesAndRegistrations(activeDog.id);
      }
    });

    // Charger tous les chiens de l'utilisateur
    this.dogService.userDogs$.subscribe(dogs => {
      this.dogs = dogs;
      console.log('Chiens de l\'utilisateur:', this.dogs);

      // Si pas de chien actif et qu'on a des chiens, en définir un par défaut
      if (!this.selectedDog && this.dogs.length > 0) {
        this.dogService.setActiveDog(this.dogs[0]);
      }
    });

    // S'assurer que les chiens sont chargés
    this.dogService.loadUserDogs();
  }

  loadCoursesAndRegistrations(dogId: number) {
    // Utiliser forkJoin pour charger les deux resources en parallèle
    forkJoin({
      courses: this.http.get<Course[]>(`${this.apiUrl}/courses`),
      registrations: this.http.get<Registration[]>(`${this.apiUrl}/dog/${dogId}/registrations`)
    }).subscribe({
      next: (result) => {
        console.log('Données chargées:', result);

        // Sauvegarder les cours
        this.courses = result.courses.map(course => {
          if (!course.registrations) {
            course.registrations = [];
          }
          return course;
        });

        // Sauvegarder les inscriptions du chien
        this.dogRegistrations = result.registrations;

        // Filtrer les cours pour ce chien
        this.filterCoursesForDog();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
      }
    });
  }

  filterCoursesForDog() {
    if (!this.selectedDog || !this.courses.length) {
      console.warn('Pas de chien sélectionné ou pas de cours disponibles');
      this.filteredCourses = [];
      return;
    }

    console.log(`Filtrage des cours pour ${this.selectedDog.name}`);

    this.filteredCourses = this.courses.filter(course => {
      // Vérifier l'éligibilité par âge
      const ageEligible = this.isDogEligibleForCourse(this.selectedDog!, course);

      // Vérifier si le chien est déjà inscrit à ce cours en utilisant les inscriptions
      const alreadyRegistered = this.isDogAlreadyRegisteredToCourse(course.id);

      // Afficher uniquement les cours où le chien est éligible ET n'est pas déjà inscrit
      return ageEligible && !alreadyRegistered;
    });

    console.log(`Nombre de cours filtrés: ${this.filteredCourses.length}`);
  }

  isDogEligibleForCourse(dog: Dog, course: Course): boolean {
    if (!course.courseType || !course.courseType.ageRange) {
      console.log(`Cours ${course.title}: pas de tranche d'âge définie, considéré comme éligible`);
      return true;
    }

    // Calculer l'âge du chien à la date du cours
    const courseDate = new Date(course.startDatetime);
    const dogBirthDate = new Date(dog.birthDate);
    const ageInMonths = differenceInMonths(courseDate, dogBirthDate);

    // Définir des valeurs par défaut pour minAge et maxAge si elles n'existent pas
    const minAge = course.courseType.ageRange.minAge !== undefined ? course.courseType.ageRange.minAge : 0;
    const maxAge = course.courseType.ageRange.maxAge !== undefined ? course.courseType.ageRange.maxAge : 240; // 20 ans

    // Vérifier si l'âge du chien est dans la tranche d'âge du cours
    const isEligible = ageInMonths >= minAge && ageInMonths <= maxAge;
    console.log(`Chien ${dog.name} (${ageInMonths} mois à la date du cours) est ${isEligible ? 'éligible' : 'non éligible'} pour le cours ${course.title} (âge requis: ${minAge}-${maxAge} mois)`);

    return isEligible;
  }

  // Utiliser les inscriptions récupérées pour vérifier si le chien est déjà inscrit
  isDogAlreadyRegisteredToCourse(courseId: number): boolean {
    if (!this.dogRegistrations || this.dogRegistrations.length === 0) {
      return false;
    }

    // Vérifier si une inscription active existe pour ce cours
    const isRegistered = this.dogRegistrations.some(registration =>
      registration.course &&
      registration.course.id === courseId &&
      (registration.status === RegistrationStatus.PENDING ||
        registration.status === RegistrationStatus.CONFIRMED)
    );

    if (isRegistered) {
      console.log(`Le chien est déjà inscrit au cours ID: ${courseId}`);
    }

    return isRegistered;
  }

  // Méthode pour obtenir le nombre d'inscriptions actives pour un cours
  getActiveRegistrationsCount(course: Course): number {
    if (!course.registrations) {
      return 0;
    }

    return course.registrations.filter(registration =>
      registration.status === RegistrationStatus.PENDING ||
      registration.status === RegistrationStatus.CONFIRMED
    ).length;
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

  // Méthode pour inscrire le chien à un cours
  registerDogForCourse(dog: Dog, course: Course) {
    // Vérifications de sécurité
    if (!dog || !dog.id) {
      console.error('Erreur: Données du chien invalides', dog);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible d\'identifier le chien pour l\'inscription',
        life: 3000,
      });
      return;
    }

    if (!course || !course.id) {
      console.error('Erreur: Données du cours invalides', course);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible d\'identifier le cours pour l\'inscription',
        life: 3000,
      });
      return;
    }

    // S'assurer que les IDs sont des nombres
    const dogId = typeof dog.id === 'string' ? parseInt(dog.id, 10) : dog.id;
    const courseId = typeof course.id === 'string' ? parseInt(course.id, 10) : course.id;

    // Créer l'objet d'inscription selon le format attendu par le backend
    // Adapter selon la structure exacte attendue par votre API
    const registration = {
      dog: { id: dogId },
      course: { id: courseId }
    };

    console.log('Tentative d\'inscription avec les données:', {
      dogId: dogId,
      courseId: courseId,
      registration: registration
    });

    // Envoyer la demande d'inscription au serveur
    this.http.post(`${this.apiUrl}/registration`, registration).subscribe({
      next: (response) => {
        console.log('Réponse du serveur après inscription:', response);

        this.messageService.add({
          severity: 'success',
          summary: 'Inscription réussie!',
          detail: `${dog.name} a été inscrit au cours "${course.title}"`,
          life: 3000,
        });

        // Recharger les inscriptions du chien pour mettre à jour la liste des cours disponibles
        this.loadCoursesAndRegistrations(dogId);
      },
      error: (error) => {
        console.error('Erreur lors de l\'inscription au cours:', error);

        let errorMessage = 'Une erreur est survenue lors de l\'inscription au cours';

        // Tenter d'extraire un message d'erreur plus précis de la réponse
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur d\'inscription',
          detail: errorMessage,
          life: 5000,
        });
      }
    });
  }


  selectDog(dog: Dog) {
    this.dogService.setActiveDog(dog);
    if (dog.id) {
      this.loadCoursesAndRegistrations(dog.id);
    }
  }

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

  protected readonly faPaw = faPaw;
  protected readonly faEye = faEye;
  protected readonly RegistrationStatus = RegistrationStatus;
}
