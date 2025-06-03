import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RegistrationService } from '../../../service/registration.service';
import { AuthStateService } from '../../../service/auth-state.service';
import { Registration } from '../../../models/registration';
import { RegistrationStatus } from '../../../models/registrationstatus.enum';
import { ButtonDirective} from 'primeng/button';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-coach-subscription-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    BadgeModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule,
    TagModule,
    ButtonDirective,
    Ripple
  ],
  templateUrl: './coach-subscription-table.component.html',
  styleUrls: ['./coach-subscription-table.component.scss']
})
export class CoachSubscriptionTableComponent implements OnInit, OnDestroy {
  pendingRegistrations: Registration[] = [];
  loading = false;
  updatingRegistration = false;
  expandedRows: {[key: string]: boolean} = {};

  private destroy$ = new Subject<void>();

  constructor(
    private registrationService: RegistrationService,
    private authStateService: AuthStateService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPendingRegistrations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPendingRegistrations(): void {
    const coachId = this.authStateService.getUserId();
    if (!coachId) {
      this.showError('Erreur', 'Impossible de récupérer l\'identifiant du coach');
      return;
    }

    this.loading = true;
    this.registrationService.getPendingRegistrations(coachId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (registrations: Registration[]) => {
          this.pendingRegistrations = registrations.sort((a, b) =>
            new Date(a.course.startDatetime).getTime() - new Date(b.course.startDatetime).getTime()
          );
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des registrations:', error);
          this.showError('Erreur', 'Impossible de charger les demandes d\'inscription');
          this.loading = false;
        }
      });
  }

  getUniqueCoursesWithRegistrations() {
    const courseMap = new Map();
    this.pendingRegistrations.forEach(registration => {
      const courseId = registration.course.id;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          course: registration.course,
          registrations: []
        });
      }
      courseMap.get(courseId).registrations.push(registration);
    });
    return Array.from(courseMap.values());
  }

  getRegistrationsForCourse(courseId: number): Registration[] {
    return this.pendingRegistrations.filter(reg => reg.course.id === courseId);
  }

  toggleRow(course: any): void {
    if (this.isRowExpanded(course)) {
      delete this.expandedRows[course.id];
    } else {
      this.expandedRows[course.id] = true;
    }
  }

  isRowExpanded(course: any): boolean {
    return this.expandedRows[course.id];
  }

  // ✅ Ajout du target comme dans votre exemple qui marche

  updateRegistrationStatus(event: Event, registration: Registration, newStatus: 'CONFIRMED' | 'REFUSED'): void {
    // Arrêter IMMÉDIATEMENT la propagation
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();

    console.log('🔥 Méthode updateRegistrationStatus appelée !');

    const actionText = newStatus === 'CONFIRMED' ? 'confirmer' : 'refuser';
    const message = `Êtes-vous sûr de vouloir ${actionText} l'inscription de ${registration.dog.name} ?`;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.performStatusUpdate(registration, newStatus);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Annulé',
          detail: 'Action annulée',
          life: 1500
        });
      }
    });
  }



  private performStatusUpdate(registration: Registration, newStatus: 'CONFIRMED' | 'REFUSED'): void {
    this.updatingRegistration = true;

    const status = newStatus === 'CONFIRMED' ? RegistrationStatus.CONFIRMED : RegistrationStatus.REFUSED;
    const actionPast = newStatus === 'CONFIRMED' ? 'confirmée' : 'refusée';

    this.registrationService.updateRegistrationStatus(registration.id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRegistration: Registration) => {
          this.showSuccess('Succès', `L'inscription de ${registration.dog.name} a été ${actionPast}`);
          this.loadPendingRegistrations();
          this.updatingRegistration = false;
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour:', error);

          if (error.error && typeof error.error === 'string' && error.error.includes('complet')) {
            this.showError('Cours complet', 'Le cours a atteint sa capacité maximale. Impossible de confirmer cette inscription.');
          } else {
            this.showError('Erreur', 'Impossible de mettre à jour le statut de l\'inscription');
          }
          this.updatingRegistration = false;
        }
      });
  }

  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusSeverity(status: string): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {
    switch (status) {
      case 'PENDING': return 'warn';
      case 'CONFIRMED': return 'success';
      case 'REFUSED': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'CONFIRMED': return 'Confirmé';
      case 'REFUSED': return 'Refusé';
      default: return status;
    }
  }

  private showSuccess(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000
    });
  }

  private showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000
    });
  }
  testClick(action: string, dogName: string): void {
    console.log(`🎯 TEST CLICK: ${action} pour ${dogName}`);
    console.log('Window size:', window.innerWidth, 'x', window.innerHeight);
  }
}
