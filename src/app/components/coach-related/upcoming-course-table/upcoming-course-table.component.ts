import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from "primeng/ripple";

import { Course } from '../../../models/course';
import { Registration } from '../../../models/registration';
import { RegistrationStatus } from '../../../models/registrationstatus.enum';

import { CoachDataService } from '../../../service/coach-data.service';
import { AuthStateService } from '../../../service/auth-state.service';

@Component({
  selector: 'app-upcoming-course-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    DatePipe,
    RippleModule
  ],
  templateUrl: './upcoming-course-table.component.html',
  styleUrl: './upcoming-course-table.component.scss'
})
export class UpcomingCourseTableComponent implements OnInit, OnDestroy {
  private authStateService = inject(AuthStateService);
  private coachDataService = inject(CoachDataService);

  coachId: number | null = null;
  upcomingCourses: Course[] = [];
  isLoading = true;
  error: string | null = null;

  expandedRows: {[key: string]: boolean} = {};
  rows = 5;
  totalRecords = 0;

  private coursesSubscription?: Subscription;

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
          this.totalRecords = this.upcomingCourses.length;
          this.isLoading = false;
          console.log(`Loaded ${this.upcomingCourses.length} courses:`, this.upcomingCourses);
        },
        error: (err) => {
          console.error("Erreur lors du chargement des cours du coach:", err);
          this.error = "Erreur lors du chargement des cours.";
          this.isLoading = false;
        }
      });
  }

  toggleRow(course: Course): void {
    if (this.isRowExpanded(course)) {
      delete this.expandedRows[course.id];
    } else {
      this.expandedRows[course.id] = true;
    }
    console.log('Row expanded state:', this.expandedRows);
  }

  isRowExpanded(course: Course): boolean {
    return this.expandedRows[course.id];
  }

  getConfirmedRegistrationsCount(course: Course): number {
    if (!course || !Array.isArray(course.registrations)) {
      return 0;
    }
    return course.registrations.filter(r => r.status === RegistrationStatus.CONFIRMED).length;
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

  getStatusIcon(status: RegistrationStatus | null): string {
    if (!status) return 'pi pi-question-circle';
    switch (status) {
      case RegistrationStatus.CONFIRMED: return 'pi pi-check-circle';
      case RegistrationStatus.PENDING: return 'pi pi-clock';
      case RegistrationStatus.REFUSED: return 'pi pi-times-circle';
      case RegistrationStatus.CANCELLED: return 'pi pi-ban';
      default: return 'pi pi-question-circle';
    }
  }

  ngOnDestroy(): void {
    if (this.coursesSubscription) {
      this.coursesSubscription.unsubscribe();
    }
  }
}
