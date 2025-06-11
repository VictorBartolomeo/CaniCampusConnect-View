import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {Subscription} from 'rxjs';
import {TableModule} from 'primeng/table';
import {TagModule} from 'primeng/tag';
import {ButtonModule} from 'primeng/button';
import {TooltipModule} from 'primeng/tooltip';
import {RippleModule} from "primeng/ripple";

import {Course} from '../../../models/course';
import {RegistrationStatus} from '../../../models/registrationstatus.enum';

import {CoachDataService} from '../../../service/coach-data.service';
import {AuthStateService} from '../../../service/auth-state.service';
import {RegistrationService} from '../../../service/registration.service';

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
  private registrationService = inject(RegistrationService); // ✅ AJOUT

  coachId: number | null = null;
  upcomingCourses: Course[] = [];
  isLoading = true;
  error: string | null = null;

  expandedRows: {[key: string]: boolean} = {};
  rows = 5;
  totalRecords = 0;

  private coursesSubscription?: Subscription;
  private courseUpdateSubscription?: Subscription; // ✅ AJOUT

  readonly RegistrationStatus = RegistrationStatus;

  ngOnInit(): void {
    this.coachId = this.authStateService.getUserId();
    if (this.coachId) {
      this.loadUpcomingCourses(this.coachId);
      this.subscribeToUpdates(); // ✅ AJOUT
    } else {
      this.error = "Impossible de récupérer l'identifiant du coach.";
      this.isLoading = false;
    }
  }

  // ✅ NOUVELLE MÉTHODE : Écouter les mises à jour de cours
  private subscribeToUpdates(): void {
    this.courseUpdateSubscription = this.registrationService.courseUpdated$
      .subscribe((courseId: number) => {
        console.log('🔄 Cours mis à jour:', courseId);
        if (this.coachId) {
          this.loadUpcomingCourses(this.coachId);
        }
      });
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
          console.log(`✅ Cours rechargés: ${this.upcomingCourses.length} cours`);
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
    // ✅ AJOUT : Nettoyer l'abonnement aux mises à jour
    if (this.courseUpdateSubscription) {
      this.courseUpdateSubscription.unsubscribe();
    }
  }
}
