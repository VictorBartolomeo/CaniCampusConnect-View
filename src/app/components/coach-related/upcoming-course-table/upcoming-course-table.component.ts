import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { RippleModule } from "primeng/ripple";

import { Course } from '../../../models/course';
import { Registration } from '../../../models/registration';
import { RegistrationStatus } from '../../../models/registrationstatus.enum';

import { CoachDataService } from '../../../service/coach-data.service';
import { AuthStateService } from '../../../service/auth-state.service';
import { RegistrationService } from '../../../service/registration.service';

interface StatusOption {
  label: string;
  value: RegistrationStatus;
  icon?: string;
}

@Component({
  selector: 'app-upcoming-course-table',
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
  templateUrl: './upcoming-course-table.component.html',
  styleUrl: './upcoming-course-table.component.scss'
})
export class UpcomingCourseTableComponent implements OnInit, OnDestroy {
  private authStateService = inject(AuthStateService);
  private coachDataService = inject(CoachDataService);
  private registrationService = inject(RegistrationService);

  coachId: number | null = null;
  upcomingCourses: Course[] = [];
  isLoading = true;
  error: string | null = null;

  // Correctement typé pour éviter les erreurs
  expandedRows: Record<number, boolean> = {};

  private coursesSubscription?: Subscription;

  statusOptions: StatusOption[] = [
    { label: 'Confirmer', value: RegistrationStatus.CONFIRMED, icon: 'pi pi-check' },
    { label: 'Refuser', value: RegistrationStatus.REFUSED, icon: 'pi pi-times' }
  ];

  readonly RegistrationStatus = RegistrationStatus;

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
              registrations: Array.isArray(course.registrations) ? course.registrations : []
            }));
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Erreur lors du chargement des cours du coach:", err);
          this.error = "Erreur lors du chargement des cours.";
          this.isLoading = false;
        }
      });
  }

  getConfirmedRegistrationsCount(course: Course): number {
    if (!course || !Array.isArray(course.registrations)) {
      return 0;
    }
    return course.registrations.filter(r => r.status === RegistrationStatus.CONFIRMED).length;
  }

  getRegistrationsToManage(course: Course): Registration[] {
    if (!course || !Array.isArray(course.registrations)) {
      return [];
    }
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
      return;
    }

    this.registrationService.updateRegistrationStatus(registration.id, newStatus)
      .subscribe({
        next: (updatedReg) => {
          const courseIndex = this.upcomingCourses.findIndex(c => c.id === course.id);
          if (courseIndex > -1) {
            const regIndex = this.upcomingCourses[courseIndex].registrations.findIndex(r => r.id === updatedReg.id);
            if (regIndex > -1) {
              this.upcomingCourses[courseIndex].registrations[regIndex] = { ...updatedReg };
              this.upcomingCourses = [...this.upcomingCourses];
            }
          }
          console.log(`Statut de l'inscription ${registration.id} mis à jour à ${newStatus}`);
        },
        error: (err) => {
          console.error(`Échec de la mise à jour du statut pour l'inscription ${registration.id}:`, err);
        }
      });
  }

  onRowExpand(event: any): void {
    this.expandedRows[event.data.id] = true;
  }

  onRowCollapse(event: any): void {
    delete this.expandedRows[event.data.id];
  }

  ngOnDestroy(): void {
    if (this.coursesSubscription) {
      this.coursesSubscription.unsubscribe();
    }
  }
}
