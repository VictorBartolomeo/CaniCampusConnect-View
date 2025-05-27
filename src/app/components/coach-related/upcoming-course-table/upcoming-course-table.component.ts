import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {Subscription} from 'rxjs';
import {TableModule, TableRowCollapseEvent, TableRowExpandEvent} from 'primeng/table';
import {TagModule} from 'primeng/tag';
import {ButtonModule} from 'primeng/button';
import {TooltipModule} from 'primeng/tooltip';
import {DropdownModule} from 'primeng/dropdown'; // Pour le changement de statut
import {FormsModule} from '@angular/forms'; // Requis pour ngModel avec p-dropdown
import {Course} from '../../../models/course';
import {Registration} from '../../../models/registration';
import {RegistrationStatus} from '../../../models/registrationstatus.enum';
import {CoachDataService} from '../../../service/coach-data.service'; // Service pour getCoursesByCoachId
import {AuthStateService} from '../../../service/auth-state.service';
import {RegistrationService} from '../../../service/registration.service';
import {RippleModule} from "primeng/ripple";

interface StatusOption {
  label: string;
  value: RegistrationStatus;
  icon?: string; // Optionnel: pour afficher une icône dans le dropdown
}

@Component({
  selector: 'app-coach-upcoming-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    DropdownModule,
    DatePipe,
    RippleModule
  ],
  templateUrl: './coach-upcoming-courses.component.html',
  styleUrls: ['./coach-upcoming-courses.component.scss']
})
export class UpcomingCourseTableComponent implements OnInit, OnDestroy {
  private authStateService = inject(AuthStateService);
  private coachDataService = inject(CoachDataService);
  private registrationService = inject(RegistrationService);

  coachId: number | null = null;
  upcomingCourses: Course[] = [];
  isLoading = true;
  error: string | null = null;
  expandedRows: { [key: string]: boolean } = {};

  private coursesSubscription?: Subscription;

  // Options pour le dropdown de changement de statut
  statusOptions: StatusOption[] = [
    { label: 'Confirmer', value: RegistrationStatus.CONFIRMED, icon: 'pi pi-check' },
    { label: 'Refuser', value: RegistrationStatus.REFUSED, icon: 'pi pi-times' }
  ];

  readonly RegistrationStatus = RegistrationStatus; // Pour l'utiliser dans le template

  ngOnInit(): void {
    this.coachId = this.authStateService.getUserId();
    if (this.coachId) {
      this.loadUpcomingCourses(this.coachId);
    } else {
      this.error = "Impossible de récupérer l'identifiant du coach.";
      this.isLoading = false;
    }
  }

  loadUpcomingCourses(coachId: number): void {
    this.isLoading = true;
    this.coursesSubscription = this.coachDataService.getCoursesByCoachId(coachId)
      .subscribe({
        next: (courses) => {
          const now = new Date();
          this.upcomingCourses = courses
            .filter(course => new Date(course.startDatetime) >= now)
            .sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime())
            .map(course => ({
              ...course,
              // S'assurer que les inscriptions sont bien un tableau
              registrations: Array.isArray(course.registrations) ? course.registrations : []
            }));
          this.isLoading = false;
          this.error = null;
        },
        error: (err) => {
          console.error("Erreur lors du chargement des cours du coach:", err);
          this.error = "Erreur lors du chargement des cours.";
          this.isLoading = false;
        }
      });
  }

  getRegistrationsToManage(course: Course): Registration[] {
    return course.registrations.filter(
      reg => reg.status === RegistrationStatus.PENDING || reg.status === RegistrationStatus.CONFIRMED
    );
  }

  getSeverityForStatus(status: RegistrationStatus): string {
    switch (status) {
      case RegistrationStatus.CONFIRMED: return 'success';
      case RegistrationStatus.PENDING: return 'warning';
      case RegistrationStatus.REFUSED: return 'danger';
      case RegistrationStatus.CANCELLED: return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: RegistrationStatus | null): string {
    if (!status) return 'N/A';
    switch (status) {
      case RegistrationStatus.CONFIRMED: return 'Confirmé';
      case RegistrationStatus.PENDING: return 'En attente';
      case RegistrationStatus.REFUSED: return 'Refusé';
      case RegistrationStatus.CANCELLED: return 'Annulé';
      default: return 'Inconnu';
    }
  }

  onRegistrationStatusChange(
    newStatus: RegistrationStatus,
    registration: Registration,
    course: Course
  ): void {
    if (!newStatus || newStatus === registration.status) {
      // Si le statut n'a pas changé ou est vide, ne rien faire (évite appels inutiles)
      // Cela peut arriver si le dropdown est réinitialisé sans sélection.
      console.log("Statut inchangé ou non sélectionné.");
      return;
    }

    this.registrationService.updateRegistrationStatus(registration.id, newStatus)
      .subscribe({
        next: (updatedReg) => {
          // Mettre à jour localement pour une réactivité immédiate
          const courseIndex = this.upcomingCourses.findIndex(c => c.id === course.id);
          if (courseIndex > -1) {
            const regIndex = this.upcomingCourses[courseIndex].registrations.findIndex(r => r.id === updatedReg.id);
            if (regIndex > -1) {
              // Crée une nouvelle référence pour la détection de changement si nécessaire
              this.upcomingCourses[courseIndex].registrations[regIndex] = { ...updatedReg };
              // Pour forcer la mise à jour si p-table ne détecte pas le changement profond
              this.upcomingCourses = [...this.upcomingCourses];
            }
          }
          console.log(`Statut de l'inscription ${registration.id} mis à jour à ${newStatus}`);
        },
        error: (err) => {
          console.error(`Échec de la mise à jour du statut pour l'inscription ${registration.id}:`, err);
          // Idéalement, afficher un message d'erreur à l'utilisateur (par ex. avec PrimeNG Toast)
        }
      });
  }

  onRowExpand(event: TableRowExpandEvent) {
    // event.data contient les données de la ligne (le cours)
    console.log('Row expanded:', event.data.title);
    this.expandedRows[event.data.id] = true;
  }

  onRowCollapse(event: TableRowCollapseEvent) {
    // event.data contient les données de la ligne (le cours)
    console.log('Row collapsed:', event.data.title);
    delete this.expandedRows[event.data.id];
  }

  // Pour reconstruire les objets Date à partir des chaînes ISO si nécessaire
  // (Votre CoachDataService le fait déjà, donc c'est juste un rappel)
  // parseDatesInCourse(course: Course): Course {
  //   return {
  //     ...course,
  //     startDatetime: new Date(course.startDatetime),
  //     endDatetime: new Date(course.endDatetime),
  //     registrations: course.registrations.map(reg => ({
  //       ...reg,
  //       // dog.birthDate si vous l'utilisez aussi
  //     }))
  //   };
  // }

  ngOnDestroy(): void {
    if (this.coursesSubscription) {
      this.coursesSubscription.unsubscribe();
    }
  }
}
