import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';

import { CourseService } from '../../../../service/course.service';
import { NotificationService } from '../../../../service/notifications.service';

@Component({
  selector: 'app-delete-course-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TagModule,
    ChipModule,
    DividerModule
  ],
  templateUrl: './delete-course-dialog-component.component.html',
  styleUrl: './delete-course-dialog-component.component.scss'
})
export class DeleteCourseDialogComponent {
  @Output() courseDeleted = new EventEmitter<number>();

  private courseService = inject(CourseService);
  private notificationService = inject(NotificationService);

  visible: boolean = false;
  loading: boolean = false;
  currentCourse: any = null;

  /**
   * ✅ Affiche la modal de confirmation
   */
  showDialog(course: any): void {
    console.log('🔷 DeleteCourseDialog - Ouverture pour cours:', course);
    this.currentCourse = course;
    this.visible = true;
  }

  /**
   * ✅ Ferme la modal
   */
  closeDialog(): void {
    console.log('🔷 DeleteCourseDialog - Fermeture modal');
    this.visible = false;
    this.currentCourse = null;
    this.loading = false;
  }

  /**
   * ✅ Confirme et exécute la suppression
   */
  confirmDelete(): void {
    if (!this.currentCourse?.id) return;

    this.loading = true;
    console.log('🔄 DeleteCourseDialog - Suppression cours:', this.currentCourse.id);

    this.courseService.deleteCourse(this.currentCourse.id).subscribe({
      next: () => {
        console.log('✅ DeleteCourseDialog - Cours supprimé');

        this.notificationService.showSuccess(
          'Cours supprimé',
          `Le cours "${this.currentCourse.title}" a été supprimé avec succès`
        );

        this.courseDeleted.emit(this.currentCourse.id);
        this.closeDialog();
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ DeleteCourseDialog - Erreur suppression:', error);

        if (error.status === 404) {
          this.notificationService.showError('Cours introuvable', 'Le cours à supprimer n\'existe plus');
        } else if (error.status === 409) {
          this.notificationService.showError(
            'Suppression impossible',
            'Ce cours ne peut pas être supprimé car il a des inscriptions en cours'
          );
        } else {
          this.notificationService.showError('Erreur', 'Une erreur est survenue lors de la suppression');
        }
      }
    });
  }

  /**
   * ✅ Vérifie si le cours est à venir
   */
  get isUpcomingCourse(): boolean {
    if (!this.currentCourse?.startDatetime) return false;
    return new Date(this.currentCourse.startDatetime) > new Date();
  }

  /**
   * ✅ Obtient le nombre d'inscriptions
   */
  get registrationCount(): number {
    return this.currentCourse?.registrationCount || this.currentCourse?.registrations?.length || 0;
  }

  /**
   * ✅ Vérifie s'il y a des inscriptions
   */
  get hasRegistrations(): boolean {
    return this.registrationCount > 0;
  }

  /**
   * ✅ Formate une date
   */
  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  /**
   * ✅ Obtient la sévérité du tag de statut
   */
  get courseStatusSeverity(): string {
    if (this.isUpcomingCourse) {
      return this.hasRegistrations ? 'warning' : 'info';
    }
    return 'secondary';
  }

  /**
   * ✅ Obtient le libellé du statut
   */
  get courseStatusLabel(): string {
    if (this.isUpcomingCourse) {
      return this.hasRegistrations ? 'À venir avec inscriptions' : 'À venir';
    }
    return 'Terminé';
  }
}
