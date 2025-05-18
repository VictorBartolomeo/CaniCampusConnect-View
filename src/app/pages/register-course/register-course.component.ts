import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfirmationService, FilterService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Dialog } from 'primeng/dialog';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPaw, faEye } from '@fortawesome/free-solid-svg-icons';
import { differenceInMonths } from 'date-fns';

import { DogService } from '../../service/dog.service';
import { Dog } from '../../models/dog';
import { Course } from '../../models/course';
import { RegistrationStatus } from '../../models/registrationstatus.enum';
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
  courses: Course[] = [];
  dogs: Dog[] = [];
  dialogVisible: boolean = false;
  selectedCourseForDialog: Course | null = null;
  selectedDog: Dog | null = null;
  filteredCourses: Course[] = [];

  ngOnInit() {
    // Récupération des cours depuis l'API
    this.http.get<Course[]>('http://localhost:8080/courses').subscribe({
      next: (courses) => {
        // Assurons-nous que tous les cours ont une propriété registrations
        this.courses = courses.map(course => {
          if (!course.registrations) {
            course.registrations = [];
          }
          return course;
        });

        console.log('Cours récupérés:', courses);
        if (this.selectedDog) {
          this.filterCoursesForDog(this.selectedDog);
        }
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });

    // Utilisation du DogService pour récupérer les chiens de l'utilisateur
    this.dogService.userDogs$.subscribe({
      next: (dogs) => {
        this.dogs = dogs;
        console.log('Chiens récupérés via DogService:', dogs);

        // Vérifier si un chien actif est défini
        const activeDog = this.dogService.getActiveDog();
        if (activeDog) {
          this.selectedDog = activeDog;
        } else if (this.dogs.length > 0) {
          this.selectedDog = this.dogs[0];
        }

        if (this.selectedDog) {
          this.filterCoursesForDog(this.selectedDog);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des chiens:', error);
      }
    });

    // S'assurer que les chiens sont chargés
    this.dogService.loadUserDogs();
  }

  // Vérifie si le chien est éligible par âge pour un cours
  isDogEligibleForCourse(dog: Dog, course: Course): boolean {
    // Vérifier que le cours a un type et une tranche d'âge définie
    if (!course.courseType || !course.courseType.ageRange) {
      console.log(`Cours ${course.title}: pas de tranche d'âge définie, considéré comme éligible`);
      return true;
    }

    // Calculer l'âge du chien à la date du cours
    const courseDate = new Date(course.startDatetime);
    const dogBirthDate = new Date(dog.birthDate);
    const ageInMonths = differenceInMonths(courseDate, dogBirthDate);

    console.log(`Chien ${dog.name}: âge à la date du cours ${course.title}: ${ageInMonths} mois`);

    // Définir des valeurs par défaut pour minAge et maxAge si elles n'existent pas
    const minAge = course.courseType.ageRange.minAge !== undefined ? course.courseType.ageRange.minAge : 0;
    const maxAge = course.courseType.ageRange.maxAge !== undefined ? course.courseType.ageRange.maxAge : 240; // 20 ans

    console.log(`Cours ${course.title}: tranche d'âge requise: ${minAge}-${maxAge} mois`);

    // Vérifier si l'âge du chien est dans la tranche d'âge du cours
    const isEligible = ageInMonths >= minAge && ageInMonths <= maxAge;
    console.log(`Chien ${dog.name} est ${isEligible ? 'éligible' : 'non éligible'} pour le cours ${course.title}`);

    return isEligible;
  }

  // Vérifie si le chien est déjà inscrit à un cours
  isDogAlreadyRegistered(dog: Dog, course: Course): boolean {
    // Si le chien n'a pas d'inscriptions, il n'est pas inscrit
    if (!dog.registrations || dog.registrations.length === 0) {
      return false;
    }

    // Si le cours n'a pas d'ID, supposons qu'il n'y a pas d'inscription
    if (!course.id) {
      return false;
    }

    // Vérifier si une inscription active existe pour ce cours
    const isRegistered = dog.registrations.some(registration =>
      registration.course.id === course.id &&
      (registration.status === RegistrationStatus.PENDING ||
        registration.status === RegistrationStatus.CONFIRMED)
    );

    if (isRegistered) {
      console.log(`Le chien ${dog.name} est déjà inscrit au cours ${course.title}`);
    }

    return isRegistered;
  }

  // Méthode pour filtrer les cours disponibles pour un chien
  filterCoursesForDog(dog: Dog) {
    if (!this.courses.length) {
      console.warn('Pas de cours disponibles pour filtrer');
      this.filteredCourses = [];
      return;
    }

    console.log(`Filtrage des cours pour ${dog.name}`);

    this.filteredCourses = this.courses.filter(course => {
      // Vérifier l'éligibilité par âge
      const ageEligible = this.isDogEligibleForCourse(dog, course);

      // Vérifier si le chien est déjà inscrit à ce cours
      const alreadyRegistered = this.isDogAlreadyRegistered(dog, course);

      // Le cours est filtré si le chien est éligible par âge ET n'est pas déjà inscrit
      return ageEligible && !alreadyRegistered;
    });

    console.log(`Nombre de cours filtrés: ${this.filteredCourses.length}`);
  }

  // Permet de changer le chien sélectionné et de filtrer les cours en conséquence
  selectDog(dog: Dog) {
    // Si nous avons besoin de détails complets du chien (avec registrations)
    // nous pouvons recharger les détails spécifiques du chien
    this.dogService.getDogDetails(dog.id).subscribe({
      next: (detailedDog) => {
        this.selectedDog = detailedDog;
        this.dogService.setActiveDog(detailedDog);
        this.filterCoursesForDog(detailedDog);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des détails du chien:', error);
        // En cas d'erreur, on utilise quand même le chien sans détails
        this.selectedDog = dog;
        this.dogService.setActiveDog(dog);
        this.filterCoursesForDog(dog);
      }
    });
  }

  //POPUP CONFIRM
  constructor(
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {}

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
        // Ici vous pourriez ajouter une méthode pour enregistrer l'inscription
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
    // Créer l'objet d'inscription
    const registration = {
      dog: { id: dog.id },
      course: { id: course.id }
    };

    // Envoyer la demande d'inscription au serveur
    this.http.post('http://localhost:8080/registrations', registration).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Inscription réussie!',
          detail: `${dog.name} a été inscrit au cours "${course.title}"`,
          life: 3000,
        });

        // Recharger les détails du chien pour mettre à jour ses inscriptions
        this.dogService.getDogDetails(dog.id).subscribe(updatedDog => {
          // Mettre à jour le chien sélectionné avec les dernières données
          this.selectedDog = updatedDog;
          this.dogService.setActiveDog(updatedDog);

          // Mettre à jour la liste des cours filtrés
          this.filterCoursesForDog(updatedDog);
        });
      },
      error: (error) => {
        console.error('Erreur lors de l\'inscription au cours:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de l\'inscription au cours',
          life: 3000,
        });
      }
    });
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

  //MODALE
  visible: boolean = false;

  protected readonly faPaw = faPaw;
  protected readonly faEye = faEye;
  protected readonly RegistrationStatus = RegistrationStatus;
}
