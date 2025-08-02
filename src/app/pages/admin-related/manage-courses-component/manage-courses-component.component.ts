import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

import { CourseService } from '../../../service/course.service';
import { CoachService } from '../../../service/coach.service';
import { NotificationService } from '../../../service/notifications.service';
import {CourseRegisterFormComponent} from '../../../components/admin-related/course-register-form-component/course-register-form-component.component';
import {CourseEditFormComponent} from '../../../components/admin-related/course-edit-form-component/course-edit-form-component.component';
import {DeleteCourseDialogComponent} from '../../../components/admin-related/utilities/delete-course-dialog-component/delete-course-dialog-component.component';
import {CourseRegistrationsDialogComponent} from '../../../components/admin-related/utilities/course-registration-dialog-component/course-registration-dialog-component.component';

interface Course {
  id: number;
  title: string;
  description?: string;
  startDatetime: Date;
  endDatetime: Date;
  maxCapacity: number;
  registrations?: any[];
  registrationCount: number;
  isUpcoming: boolean;
  coach?: any;
  courseType?: any;
}

interface Coach {
  id: number;
  firstname: string;
  lastname: string;
  email?: string;
}

@Component({
  selector: 'app-manage-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // ✅ Ajout pour ngModel
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    TooltipModule,
    ProgressSpinnerModule,
    CardModule,
    BadgeModule,
    ChipModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    CourseRegisterFormComponent,
    CourseEditFormComponent,
    CourseRegistrationsDialogComponent,
    DeleteCourseDialogComponent
  ],
  templateUrl: './manage-courses-component.component.html',
  styleUrl: './manage-courses-component.component.scss'
})
export class ManageCoursesComponent implements OnInit {
  @ViewChild('courseRegisterForm') courseRegisterForm!: CourseRegisterFormComponent;
  @ViewChild('courseEditForm') courseEditForm!: CourseEditFormComponent;
  @ViewChild('registrationsDialog') registrationsDialog!: CourseRegistrationsDialogComponent;
  @ViewChild('deleteCourseDialog') deleteCourseDialog!: DeleteCourseDialogComponent;

  private courseService = inject(CourseService);
  private coachService = inject(CoachService);
  private notificationService = inject(NotificationService);

  courses: Course[] = [];
  coaches: Coach[] = [];
  loading: boolean = false;
  selectedCourse: Course | null = null;

  // Filtres
  filterType: string = 'all'; // 'all', 'upcoming', 'past'
  filterOptions = [
    { label: 'Tous les cours', value: 'all' },
    { label: 'Cours à venir', value: 'upcoming' },
    { label: 'Cours passés', value: 'past' }
  ];

  ngOnInit() {
    this.loadCourses();
    this.loadCoaches();
  }

  /**
   * ✅ Charge tous les cours
   */
  loadCourses(): void {
    this.loading = true;
    console.log('🔄 ManageCoursesComponent - Chargement des cours...');

    this.courseService.getAllCourses().subscribe({
      next: (courses: any[]) => {
        this.courses = courses.map((course: any) => ({
          ...course,
          // Conversion des strings ISO en objets Date pour le frontend
          startDatetime: new Date(course.startDatetime),
          endDatetime: new Date(course.endDatetime),
          isUpcoming: new Date(course.startDatetime) > new Date(),
          // Calcul du nombre d'inscriptions si disponible
          registrationCount: course.registrations?.length || 0
        }));

        console.log(`✅ ManageCoursesComponent - ${courses.length} cours chargés:`, this.courses);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ ManageCoursesComponent - Erreur lors du chargement:', error);

        // Gestion des erreurs selon votre documentation
        if (error.status === 401) {
          this.notificationService.showError('Non authentifié', 'Veuillez vous reconnecter');
        } else if (error.status === 403) {
          this.notificationService.showError('Accès refusé', 'Vous n\'avez pas les droits nécessaires');
        } else {
          this.notificationService.showError('Erreur', 'Impossible de charger les cours');
        }

        this.loading = false;
      }
    });
  }


  /**
   * ✅ Charge la liste des coachs pour les formulaires
   */
  loadCoaches(): void {
    this.coachService.getAllCoaches().subscribe({
      next: (coaches: Coach[]) => {
        this.coaches = coaches;
        console.log(`✅ ManageCoursesComponent - ${coaches.length} coachs chargés`);
      },
      error: (error: any) => {
        console.error('❌ ManageCoursesComponent - Erreur chargement coachs:', error);
      }
    });
  }

  /**
   * ✅ Filtre les cours selon le type sélectionné
   */
  get filteredCourses(): Course[] {
    const now = new Date();

    switch (this.filterType) {
      case 'upcoming':
        return this.courses.filter((course: Course) => course.startDatetime > now);
      case 'past':
        return this.courses.filter((course: Course) => course.startDatetime < now);
      default:
        return this.courses;
    }
  }

  /**
   * ✅ Ouvre le formulaire de création de cours
   */
  openCreateDialog(): void {
    console.log('🔷 ManageCoursesComponent - Ouverture formulaire création');
    this.courseRegisterForm.showDialog();
  }

  /**
   * ✅ Ouvre le formulaire d'édition
   */
  openEditDialog(course: Course): void {
    console.log('🔷 ManageCoursesComponent - Ouverture formulaire édition:', course);
    this.selectedCourse = course;
    this.courseEditForm.showDialog(course);
  }

  /**
   * ✅ Ouvre la dialog des inscriptions
   */
  openRegistrationsDialog(course: Course): void {
    console.log('🔷 ManageCoursesComponent - Ouverture dialog inscriptions:', course);
    this.selectedCourse = course;
    this.registrationsDialog.showDialog(course);
  }

  /**
   * ✅ Ouvre la dialog de suppression
   */
  openDeleteDialog(course: Course): void {
    console.log('🔷 ManageCoursesComponent - Ouverture dialog suppression:', course);
    this.selectedCourse = course;
    this.deleteCourseDialog.showDialog(course);
  }

  /**
   * ✅ Callback après création d'un cours
   */
  onCourseAdded(newCourse: any): void {
    console.log('✅ ManageCoursesComponent - Cours ajouté:', newCourse);
    this.loadCourses(); // Recharger la liste
    this.notificationService.showSuccess(
      'Cours créé',
      `Le cours "${newCourse.title}" a été créé avec succès`
    );
  }

  /**
   * ✅ Callback après modification d'un cours
   */
  onCourseUpdated(updatedCourse: any): void {
    console.log('✅ ManageCoursesComponent - Cours modifié:', updatedCourse);
    this.loadCourses(); // Recharger la liste
    this.notificationService.showSuccess(
      'Cours modifié',
      `Le cours "${updatedCourse.title}" a été modifié avec succès`
    );
  }

  /**
   * ✅ Callback après suppression d'un cours
   */
  onCourseDeleted(courseId: number): void {
    console.log('✅ ManageCoursesComponent - Cours supprimé:', courseId);
    this.courses = this.courses.filter((course: Course) => course.id !== courseId);

    // Message selon la documentation backend
    this.notificationService.showSuccess(
      'Cours supprimé',
      'Le cours et toutes les inscriptions associées ont été supprimés avec succès'
    );
  }


  /**
   * ✅ Obtient la sévérité du tag selon le statut du cours
   */
  getCourseStatusSeverity(course: Course): string {
    const now = new Date();
    if (course.startDatetime > now) {
      return 'info'; // À venir
    } else if (course.endDatetime > now) {
      return 'warning'; // En cours
    } else {
      return 'success'; // Terminé
    }
  }

  /**
   * ✅ Obtient le libellé du statut du cours
   */
  getCourseStatusLabel(course: Course): string {
    const now = new Date();
    if (course.startDatetime > now) {
      return 'À venir';
    } else if (course.endDatetime > now) {
      return 'En cours';
    } else {
      return 'Terminé';
    }
  }

  /**
   * ✅ Obtient la couleur du chip de capacité
   */
  getCapacityChipSeverity(course: Course): string {
    const percentage = (course.registrationCount / course.maxCapacity) * 100;
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
  }

  /**
   * ✅ Formate une date pour l'affichage
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * ✅ Obtient le résumé du filtre pour l'affichage
   */
  getFilterSummary(): string {
    const count = this.filteredCourses.length;
    if (this.filterType === 'all') {
      return `${count} cours au total`;
    }

    const filterOption = this.filterOptions.find(option => option.value === this.filterType);
    const filterLabel = filterOption ? filterOption.label.toLowerCase() : '';
    return `${count} ${filterLabel}`;
  }

  /**
   * ✅ Remet le filtre à "tous"
   */
  resetFilter(): void {
    this.filterType = 'all';
  }

  /**
   * ✅ Obtient le libellé de capacité
   */
  getCapacityLabel(course: Course): string {
    return `${course.registrationCount}/${course.maxCapacity}`;
  }

  /**
   * ✅ Obtient le style pour le chip de capacité (remplace severity)
   */
  getCapacityChipStyle(course: Course): any {
    const percentage = (course.registrationCount / course.maxCapacity) * 100;

    if (percentage >= 100) {
      return { 'background-color': '#dc2626', 'color': 'white' }; // Rouge
    } else if (percentage >= 80) {
      return { 'background-color': '#f59e0b', 'color': 'white' }; // Orange
    } else {
      return { 'background-color': '#10b981', 'color': 'white' }; // Vert
    }
  }

  /**
   * ✅ Supprime l'ancienne méthode getCapacityChipSeverity
   * (remplacée par getCapacityChipStyle car p-chip ne supporte pas severity)
   */

  /**
   * ✅ Formate une heure pour l'affichage
   */
  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

}
