
import {Component, inject, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {Carousel} from 'primeng/carousel';
import {Dialog} from 'primeng/dialog';
import {forkJoin, Subscription} from 'rxjs';
import {DogService} from '../../../service/dog.service';
import {Dog} from '../../../models/dog';
import {PrimeTemplate} from 'primeng/api';
import {Registration} from '../../../models/registration';
import {RegistrationStatus} from '../../../models/registrationstatus.enum';
import {NotificationService} from '../../../service/notifications.service';
import {IcsService} from '../../../service/ics.service';
import {Badge} from 'primeng/badge';
import {ButtonDirective} from 'primeng/button';
import {Tooltip} from 'primeng/tooltip';
import {DatePipe} from '@angular/common';
import {CourseService} from '../../../service/course.service';
import {RegistrationService} from '../../../service/registration.service';
import {ProgressBar} from 'primeng/progressbar';

@Component({
  selector: 'app-course-card',
  imports: [
    Card,
    Carousel,
    Dialog,
    PrimeTemplate,
    Badge,
    ButtonDirective,
    Tooltip,
    DatePipe,
    ProgressBar
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent implements OnInit {

  registrations: Registration[] = [];
  private registrationService = inject(RegistrationService);

  responsiveOptions: any[] | undefined;
  activeDog: Dog | null = null;
  private subscription!: Subscription;
  private currentDogId: number | null = null;
  private notificationService = inject(NotificationService);
  private icsService = inject(IcsService);
  registrationCounts: { [courseId: number]: number } = {};
  loadingCounts: { [courseId: number]: boolean } = {};
  downloading: { [key: string]: boolean } = {};

  // ✅ Propriétés pour le dialog d'annulation
  cancelDialogVisible = false;
  registrationToCancel: Registration | null = null;
  cancellingRegistration = false;

  constructor(
    private dogService: DogService
  ) {
  }

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

  getCarouselItems() {
    if (this.registrations && this.registrations.length > 0) {
      return this.registrations.map(registration => ({registration}));
    } else {
      return [{registration: null}];
    }
  }

  downloadCourseICS(registration: any): void {
    if (!registration?.course) {
      this.notificationService.showError('Erreur', 'Informations du cours manquantes');
      return;
    }

    const courseId = registration.course.id;
    this.downloading[courseId] = true;

    try {
      console.log('📥 CourseCard - Téléchargement ICS pour:', registration.course.title);

      const dogName = registration.dog?.name || 'Mon chien';
      this.icsService.downloadCourseICS(registration.course, dogName);

      this.notificationService.showSuccess(
        'Calendrier téléchargé',
        `Le cours "${registration.course.title}" a été ajouté à votre calendrier`
      );

    } catch (error) {
      console.error('❌ CourseCard - Erreur téléchargement ICS:', error);
      this.notificationService.showError(
        'Erreur de téléchargement',
        'Impossible de télécharger le fichier calendrier'
      );
    } finally {
      setTimeout(() => {
        this.downloading[courseId] = false;
      }, 1000);
    }
  }
  /**
   * ✅ Confirme et exécute l'annulation
   */
  confirmCancelRegistration(): void {
    if (!this.registrationToCancel?.id) return;

    this.cancellingRegistration = true;
    console.log('🔄 CourseCard - Annulation inscription:', this.registrationToCancel.id);

    this.registrationService.cancelRegistration(this.registrationToCancel.id).subscribe({
      next: () => {
        console.log('✅ CourseCard - Inscription annulée');

        this.notificationService.showSuccess(
          'Inscription annulée',
          `L'inscription de ${this.registrationToCancel?.dog?.name} au cours "${this.registrationToCancel?.course?.title}" a été annulée`
        );

        // ✅ CORRECTION : Supprimer l'inscription de la liste locale au lieu d'appeler refreshActiveDog()
        if (this.registrationToCancel) {
          this.registrations = this.registrations.filter(
            reg => reg.id !== this.registrationToCancel!.id
          );

          // Rafraîchir le comptage pour ce cours
          this.refreshRegistrationCount(this.registrationToCancel.course.id);
        }

        this.cancelDialogVisible = false;
        this.registrationToCancel = null;
      },
      error: (error) => {
        console.error('❌ CourseCard - Erreur annulation:', error);

        if (error.status === 404) {
          this.notificationService.showError('Inscription introuvable', 'L\'inscription à annuler n\'existe plus');
        } else if (error.status === 409) {
          this.notificationService.showError(
            'Annulation impossible',
            'Le cours a déjà commencé, vous ne pouvez plus annuler votre inscription'
          );
        } else if (error.status === 403) {
          this.notificationService.showError(
            'Action non autorisée',
            'Vous n\'êtes pas autorisé à annuler cette inscription'
          );
        } else {
          this.notificationService.showError('Erreur', 'Une erreur est survenue lors de l\'annulation');
        }
      },
      complete: () => {
        this.cancellingRegistration = false;
      }
    });
  }

  onCancelClick(registration: Registration): void {
    console.log('🔄 Click détecté sur bouton annulation:', registration);
    console.log('🔄 Course started?', this.isCourseStarted(registration.course));
    console.log('🔄 Registration:', registration);

    this.showCancelDialog(registration);
  }

  /**
   * ✅ Affiche le dialog de confirmation d'annulation
   */
  showCancelDialog(registration: Registration): void {
    console.log('🔄 showCancelDialog appelé avec:', registration);
    this.registrationToCancel = registration;
    this.cancelDialogVisible = true;
    console.log('🔄 Dialog visible:', this.cancelDialogVisible);
  }



  /**
   * ✅ Vérifie si le cours a déjà commencé (pour désactiver le bouton)
   */
  isCourseStarted(course: any): boolean {
    if (!course?.startDatetime) return false;
    const now = new Date();
    const startDate = new Date(course.startDatetime);
    return startDate <= now;
  }

  isDownloading(courseId: string): boolean {
    return this.downloading[courseId] || false;
  }

  getCoachName(course: any): string {
    if (!course?.coach) return 'Coach non assigné';

    const firstname = course.coach.firstname || '';
    const lastname = course.coach.lastname || '';

    return `${firstname} ${lastname}`.trim() || 'Coach inconnu';
  }

  getCourseStatus(course: any): { label: string; severity: string } {
    if (!course) return {label: 'Inconnu', severity: 'secondary'};

    const now = new Date();
    const startDate = new Date(course.startDatetime);
    const endDate = new Date(course.endDatetime);

    if (endDate < now) {
      return {label: 'Terminé', severity: 'secondary'};
    } else if (startDate > now) {
      return {label: 'À venir', severity: 'success'};
    } else {
      return {label: 'En cours', severity: 'warning'};
    }
  }

  loadRegistrationsForDog(dog: Dog) {
    this.activeDog = dog;
    if (dog.registrations && dog.registrations.length > 0) {
      const currentDate = new Date();

      this.registrations = dog.registrations
        .filter(registration => {
          const courseStartDate = new Date(registration.course.startDatetime);
          return courseStartDate >= currentDate;
        })
        .sort((a, b) => {
          const dateA = new Date(a.course.startDatetime).getTime();
          const dateB = new Date(b.course.startDatetime).getTime();
          return dateA - dateB;
        });

      this.loadRegistrationCounts();
      console.log('Inscriptions aux cours à venir pour le chien (triées par date):', this.registrations);
    } else {
      this.registrations = [];
      console.log('Aucune inscription aux cours disponible pour ce chien');
    }
  }

  private loadRegistrationCounts(): void {
    const courseIds = this.registrations.map(reg => reg.course.id);
    const uniqueCourseIds = [...new Set(courseIds)];

    const countRequests = uniqueCourseIds.map(courseId => {
      this.loadingCounts[courseId] = true;
      return this.registrationService.getRegistrationsCount(courseId);
    });

    forkJoin(countRequests).subscribe({
      next: (counts) => {
        uniqueCourseIds.forEach((courseId, index) => {
          this.registrationCounts[courseId] = counts[index];
          this.loadingCounts[courseId] = false;
        });
        console.log('✅ Comptages de registrations chargés:', this.registrationCounts);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des comptages:', error);
        uniqueCourseIds.forEach(courseId => {
          this.loadingCounts[courseId] = false;
        });
      }
    });
  }

  private refreshRegistrationCount(courseId: number): void {
    this.loadingCounts[courseId] = true;
    this.registrationService.getRegistrationsCount(courseId).subscribe({
      next: (count) => {
        this.registrationCounts[courseId] = count;
        this.loadingCounts[courseId] = false;
        console.log(`✅ Comptage rafraîchi pour le cours ${courseId}:`, count);
      },
      error: (error) => {
        console.error(`❌ Erreur lors du rafraîchissement du comptage pour le cours ${courseId}:`, error);
        this.loadingCounts[courseId] = false;
      }
    });
  }

  /**
   * Retourne la classe CSS pour styliser la barre de progression PrimeNG
   */
  getProgressBarStyleClass(course: any): string {
    const percentage = this.getCapacityPercentage(course);

    if (percentage >= 100) {
      return 'progress-bar-full'; // Rouge - Complet
    } else if (percentage >= 80) {
      return 'progress-bar-high'; // Orange - Presque plein
    } else if (percentage >= 60) {
      return 'progress-bar-medium'; // Jaune - À moitié plein
    } else {
      return 'progress-bar-low'; // Vert - Beaucoup de places
    }
  }

  /**
   * Mise à jour de la méthode pour utiliser les données réelles
   */
  getCapacityPercentage(course: any): number {
    if (!course?.maxCapacity) return 0;

    const actualCount = this.getActualRegistrationCount(course);
    const percentage = (actualCount / course.maxCapacity) * 100;

    return Math.min(Math.round(percentage), 100);

  }


  getActualRegistrationCount(course: any): number {
    const courseId = course.id;
    return this.registrationCounts[courseId] || course.registrationCount || 0;
  }

  isCountLoading(course: any): boolean {
    return this.loadingCounts[course.id] || false;
  }

  getStatusClass(status: RegistrationStatus | null): string {
    if (!status) return 'status-unknown';

    switch (status) {
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

  getRegistrationStatusSeverity(status: RegistrationStatus | null): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (!status) return 'secondary';

    switch (status) {
      case RegistrationStatus.CONFIRMED:
        return 'success';
      case RegistrationStatus.PENDING:
        return 'warn';
      case RegistrationStatus.CANCELLED:
      case RegistrationStatus.REFUSED:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: RegistrationStatus | null): string {
    if (!status) return 'Non défini';

    switch (status) {
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


  getCapacityBarClass(course: any): string {
    const percentage = this.getCapacityPercentage(course);

    if (percentage >= 100) {
      return 'bg-red-500';
    } else if (percentage >= 80) {
      return 'bg-orange-500';
    } else if (percentage >= 60) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'CONFIRMÉ':
        return 'pi pi-check-circle';
      case 'EN ATTENTE':
        return 'pi pi-clock';
      case 'ANNULÉ':
        return 'pi pi-times-circle';
      case 'REFUSÉ':
        return 'pi pi-ban';
      default:
        return 'pi pi-question-circle';
    }
  }
}
