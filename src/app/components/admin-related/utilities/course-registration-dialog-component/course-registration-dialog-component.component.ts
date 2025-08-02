import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ConfirmationService } from 'primeng/api';
import {RegistrationService} from '../../../../service/registration.service';
import {NotificationService} from '../../../../service/notifications.service';

@Component({
  selector: 'app-course-registrations-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TableModule,
    TagModule,
    ChipModule,
    AvatarModule,
    ProgressSpinnerModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './course-registration-dialog-component.component.html',
  styleUrl: './course-registration-dialog-component.component.scss'
})
export class CourseRegistrationsDialogComponent {
  private registrationService = inject(RegistrationService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  visible: boolean = false;
  loading: boolean = false;
  currentCourse: any = null;
  registrations: any[] = [];

  /**
   * ✅ Affiche la modal avec les inscriptions du cours
   */
  showDialog(course: any): void {
    console.log('🔷 CourseRegistrationsDialog - Ouverture pour cours:', course);
    this.currentCourse = course;
    this.visible = true;
    this.loadRegistrations();
  }

  /**
   * ✅ Ferme la modal
   */
  closeDialog(): void {
    console.log('🔷 CourseRegistrationsDialog - Fermeture modal');
    this.visible = false;
    this.currentCourse = null;
    this.registrations = [];
    this.loading = false;
  }

  /**
   * ✅ Charge les inscriptions du cours
   */
  private loadRegistrations(): void {
    if (!this.currentCourse?.id) return;

    this.loading = true;
    console.log('🔄 CourseRegistrationsDialog - Chargement inscriptions pour cours:', this.currentCourse.id);

    // Si le cours a déjà ses inscriptions
    if (this.currentCourse.registrations) {
      this.registrations = this.processRegistrations(this.currentCourse.registrations);
      this.loading = false;
      return;
    }

    // Sinon, charger depuis l'API (si vous avez cet endpoint)
    this.registrationService.getRegistrationsByCourseId(this.currentCourse.id).subscribe({
      next: (registrations) => {
        this.registrations = this.processRegistrations(registrations);
        this.loading = false;
        console.log('✅ CourseRegistrationsDialog - Inscriptions chargées:', this.registrations);
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ CourseRegistrationsDialog - Erreur chargement inscriptions:', error);
        this.notificationService.showError('Erreur', 'Impossible de charger les inscriptions');
      }
    });
  }

  /**
   * ✅ Traite les données d'inscription pour l'affichage
   */
  private processRegistrations(registrations: any[]): any[] {
    return registrations.map(registration => ({
      ...registration,
      ownerFullName: this.getOwnerFullName(registration),
      dogAge: this.calculateDogAge(registration.dog?.birthDate)
    }));
  }

  /**
   * ✅ Obtient le nom complet du propriétaire
   */
  private getOwnerFullName(registration: any): string {
    const owner = registration.dog?.owner || registration.owner;
    if (!owner) return 'Propriétaire inconnu';
    return `${owner.firstname || ''} ${owner.lastname || ''}`.trim();
  }

  /**
   * ✅ Calcule l'âge du chien
   */
  private calculateDogAge(birthDate: string | Date): string {
    if (!birthDate) return 'Âge inconnu';

    const birth = new Date(birthDate);
    const now = new Date();
    const ageInMonths = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

    if (ageInMonths < 12) {
      return `${ageInMonths} mois`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years} an${years > 1 ? 's' : ''} ${months} mois` : `${years} an${years > 1 ? 's' : ''}`;
    }
  }

  /**
   * ✅ Annule une inscription
   */
  cancelRegistration(registration: any): void {
    if (!registration?.id) return;

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir annuler l'inscription de ${registration.dog?.name || 'ce chien'} ?`,
      header: 'Confirmer l\'annulation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, annuler',
      rejectLabel: 'Non',
      accept: () => {
        this.performCancelRegistration(registration);
      }
    });
  }

  /**
   * ✅ Exécute l'annulation de l'inscription
   */
  private performCancelRegistration(registration: any): void {
    console.log('🔄 CourseRegistrationsDialog - Annulation inscription:', registration.id);

    this.registrationService.cancelRegistration(registration.id).subscribe({
      next: () => {
        console.log('✅ CourseRegistrationsDialog - Inscription annulée');

        this.notificationService.showSuccess(
          'Inscription annulée',
          `L'inscription de ${registration.dog?.name || 'ce chien'} a été annulée`
        );

        // Retirer l'inscription de la liste
        this.registrations = this.registrations.filter(r => r.id !== registration.id);

        // Mettre à jour le cours actuel
        if (this.currentCourse.registrations) {
          this.currentCourse.registrations = this.currentCourse.registrations.filter((r: any) => r.id !== registration.id);
        }
      },
      error: (error) => {
        console.error('❌ CourseRegistrationsDialog - Erreur annulation:', error);
        this.notificationService.showError('Erreur', 'Impossible d\'annuler l\'inscription');
      }
    });
  }

  /**
   * ✅ Obtient les initiales du chien
   */
  getDogInitial(dogName: string): string {
    if (!dogName) return '?';
    return dogName.charAt(0).toUpperCase();
  }

  /**
   * ✅ Obtient une couleur d'avatar basée sur la race
   */
  getDogAvatarColor(breedName: string): string {
    if (!breedName) return '#6b7280'; // Gris par défaut

    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#22c55e', '#10b981', '#14b8a6',
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
    ];

    // Hash simple du nom de race pour obtenir une couleur consistante
    let hash = 0;
    for (let i = 0; i < breedName.length; i++) {
      hash = breedName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * ✅ Formate une date
   */
  formatDate(date: string | Date): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }

  /**
   * ✅ Calcule le pourcentage de remplissage
   */
  get fillPercentage(): number {
    if (!this.currentCourse?.maxCapacity) return 0;
    return Math.round((this.registrations.length / this.currentCourse.maxCapacity) * 100);
  }

  /**
   * ✅ Obtient la classe CSS pour la barre de progression
   */
  get progressBarClass(): string {
    const percentage = this.fillPercentage;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  }
}
