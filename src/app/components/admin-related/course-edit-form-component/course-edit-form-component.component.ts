import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import {CourseService} from '../../../service/course.service';
import {CoachService} from '../../../service/coach.service';
import {NotificationService} from '../../../service/notifications.service';


@Component({
  selector: 'app-course-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule
  ],
  templateUrl: './course-edit-form-component.component.html',
  styleUrl: './course-edit-form-component.component.scss'
})
export class CourseEditFormComponent implements OnInit {
  @Output() courseUpdated = new EventEmitter<any>();

  private formBuilder = inject(FormBuilder);
  private courseService = inject(CourseService);
  private coachService = inject(CoachService);
  private notificationService = inject(NotificationService);

  courseForm!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  visible: boolean = false;
  currentCourse: any = null;

  coaches: any[] = [];
  courseTypes: any[] = [
    { label: 'Éducation de base', value: 1, name: 'Éducation de base' },
    { label: 'Agility', value: 2, name: 'Agility' },
    { label: 'Obéissance', value: 3, name: 'Obéissance' },
    { label: 'Socialisation', value: 4, name: 'Socialisation' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadCoaches();
  }

  /**
   * Initialise le formulaire
   */
  private initForm(): void {
    this.courseForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.maxLength(500)
      ]],
      startDatetime: ['', Validators.required],
      endDatetime: ['', Validators.required],
      maxCapacity: [10, [
        Validators.required,
        Validators.min(1),
        Validators.max(50)
      ]],
      coach: ['', Validators.required],
      courseType: ['', Validators.required]
    }, {
      validators: this.dateRangeValidator
    });
  }

  /**
   * ✅ Validateur pour les dates
   */
  private dateRangeValidator(group: FormGroup) {
    const start = group.get('startDatetime')?.value;
    const end = group.get('endDatetime')?.value;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate <= startDate) {
        return { dateRangeInvalid: true };
      }

      const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      if (diffHours > 24) {
        return { courseTooLong: true };
      }
    }
    return null;
  }

  /**
   * ✅ Charge les coachs
   */
  private loadCoaches(): void {
    this.coachService.getAllCoaches().subscribe({
      next: (coaches) => {
        this.coaches = coaches.map(coach => ({
          label: `${coach.firstname} ${coach.lastname}`,
          value: coach.id,
          ...coach
        }));
      },
      error: (error) => {
        console.error('❌ CourseEditForm - Erreur chargement coachs:', error);
      }
    });
  }

  /**
   * ✅ Affiche la modal avec les données du cours
   */
  showDialog(course: any): void {
    console.log('🔷 CourseEditForm - Ouverture modal avec cours:', course);
    this.currentCourse = course;
    this.visible = true;
    this.populateForm(course);
  }

  /**
   * ✅ Remplit le formulaire avec les données du cours
   */
  private populateForm(course: any): void {
    this.courseForm.patchValue({
      title: course.title,
      description: course.description || '',
      startDatetime: new Date(course.startDatetime),
      endDatetime: new Date(course.endDatetime),
      maxCapacity: course.maxCapacity,
      coach: course.coach?.id,
      courseType: course.courseType?.id
    });

    this.submitted = false;
    this.loading = false;
  }

  /**
   * ✅ Ferme la modal
   */
  closeDialog(): void {
    console.log('🔷 CourseEditForm - Fermeture modal');
    this.visible = false;
    this.currentCourse = null;
    this.courseForm.reset();
  }

  /**
   * ✅ Getter pour les contrôles
   */
  get f() {
    return this.courseForm.controls;
  }

  /**
   * ✅ Vérifie si un champ est invalide
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.courseForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || this.submitted));
  }

  /**
   * ✅ Soumission du formulaire
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.courseForm.invalid) {
      this.notificationService.showError(
        'Formulaire invalide',
        'Veuillez corriger les erreurs du formulaire'
      );
      return;
    }

    this.loading = true;

    const formData = this.courseForm.value;
    const courseData = {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      startDatetime: formData.startDatetime.toISOString(),
      endDatetime: formData.endDatetime.toISOString(),
      maxCapacity: formData.maxCapacity,
      coach: { id: formData.coach },
      courseType: { id: formData.courseType }
    };

    console.log('📤 CourseEditForm - Mise à jour cours:', this.currentCourse.id, courseData);

    this.courseService.updateCourse(this.currentCourse.id, courseData).subscribe({
      next: (updatedCourse) => {
        this.loading = false;
        console.log('✅ CourseEditForm - Cours mis à jour:', updatedCourse);

        this.notificationService.showSuccess(
          'Cours modifié',
          `Le cours "${courseData.title}" a été modifié avec succès`
        );

        this.courseUpdated.emit(updatedCourse);
        this.closeDialog();
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ CourseEditForm - Erreur:', error);

        if (error.status === 400) {
          this.notificationService.showError('Données invalides', 'Veuillez vérifier les informations saisies');
        } else if (error.status === 404) {
          this.notificationService.showError('Cours introuvable', 'Le cours à modifier n\'existe plus');
        } else {
          this.notificationService.showError('Erreur', 'Une erreur est survenue lors de la modification');
        }
      }
    });
  }
}
