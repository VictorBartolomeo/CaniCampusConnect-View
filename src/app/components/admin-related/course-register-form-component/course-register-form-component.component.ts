import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import {CourseService} from '../../../service/course.service';
import {CoachService} from '../../../service/coach.service';
import {NotificationService} from '../../../service/notifications.service';

@Component({
  selector: 'app-course-register-form',
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
  templateUrl: './course-register-form-component.component.html',
  styleUrl: './course-register-form-component.component.scss'
})
export class CourseRegisterFormComponent implements OnInit {
  @Output() courseAdded = new EventEmitter<any>();

  private formBuilder = inject(FormBuilder);
  private courseService = inject(CourseService);
  private coachService = inject(CoachService);
  private notificationService = inject(NotificationService);

  courseForm!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  visible: boolean = false;

  coaches: any[] = [];
  courseTypes: any[] = [
    { label: 'Éducation de base', value: 1, name: 'Éducation de base' },
    { label: 'Agility', value: 2, name: 'Agility' },
    { label: 'Obéissance', value: 3, name: 'Obéissance' },
    { label: 'Socialisation', value: 4, name: 'Socialisation' }
  ];

  minDate: Date = new Date();

  ngOnInit() {
    this.initForm();
    this.loadCoaches();
  }

  /**
   * ✅ Initialise le formulaire
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
   * ✅ Validateur personnalisé pour les dates
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

      // Vérifier que le cours ne dure pas plus de 24 heures
      const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      if (diffHours > 24) {
        return { courseTooLong: true };
      }
    }
    return null;
  }

  /**
   * ✅ Charge la liste des coachs avec debug amélioré
   */
  private loadCoaches(): void {
    console.log('🔄 CourseRegisterForm - Début chargement coachs...');

    this.coachService.getAllCoaches().subscribe({
      next: (coaches) => {
        console.log('📥 CourseRegisterForm - Réponse brute coachs:', coaches);

        if (!coaches || coaches.length === 0) {
          console.log('⚠️ CourseRegisterForm - Aucun coach trouvé');
          this.coaches = [];
          this.notificationService.showWarning(
            'Aucun coach disponible',
            'Veuillez d\'abord créer des coachs avant de créer des cours'
          );
          return;
        }

        this.coaches = coaches.map(coach => ({
          label: `${coach.firstname || 'Prénom inconnu'} ${coach.lastname || 'Nom inconnu'}`,
          value: coach.id,
          ...coach
        }));

        console.log('✅ CourseRegisterForm - Coachs traités:', this.coaches);
      },
      error: (error) => {
        console.error('❌ CourseRegisterForm - Erreur chargement coachs:', error);
        console.error('📋 Détails erreur:', {
          status: error.status,
          message: error.message,
          url: error.url
        });

        this.coaches = [];

        if (error.status === 401) {
          this.notificationService.showError('Non authentifié', 'Veuillez vous reconnecter');
        } else if (error.status === 403) {
          this.notificationService.showError('Accès refusé', 'Vous n\'avez pas les droits pour voir les coachs');
        } else if (error.status === 404) {
          this.notificationService.showError('Service introuvable', 'Le service des coachs n\'est pas disponible');
        } else {
          this.notificationService.showError('Erreur réseau', 'Impossible de charger la liste des coachs');
        }
      }
    });
  }

  /**
   * ✅ Affiche la modal
   */
  showDialog(): void {
    console.log('🔷 CourseRegisterForm - Ouverture modal');
    console.log('👥 Coachs disponibles:', this.coaches.length);

    this.visible = true;
    this.resetForm();

    // Recharger les coachs si la liste est vide
    if (this.coaches.length === 0) {
      console.log('🔄 CourseRegisterForm - Rechargement des coachs...');
      this.loadCoaches();
    }
  }

  /**
   * ✅ Ferme la modal
   */
  closeDialog(): void {
    console.log('🔷 CourseRegisterForm - Fermeture modal');
    this.visible = false;
    this.resetForm();
  }

  /**
   * ✅ Remet à zéro le formulaire
   */
  private resetForm(): void {
    this.courseForm.reset();
    this.courseForm.patchValue({
      maxCapacity: 10
    });
    this.submitted = false;
    this.loading = false;
  }

  /**
   * ✅ Getter pour les contrôles du formulaire
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
   * ✅ Met à jour automatiquement l'heure de fin
   */
  onStartDateChange(): void {
    const startDate = this.courseForm.get('startDatetime')?.value;
    if (startDate) {
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1); // Durée par défaut : 1 heure
      this.courseForm.patchValue({
        endDatetime: endDate
      });
    }
  }

  /**
   * ✅ Soumission du formulaire
   */
  onSubmit(): void {
    this.submitted = true;

    console.log('📤 CourseRegisterForm - Tentative de soumission');
    console.log('📋 État du formulaire:', {
      valid: this.courseForm.valid,
      errors: this.getFormErrors(),
      values: this.courseForm.value,
      coachesAvailable: this.coaches.length
    });

    // Vérifier qu'il y a des coachs
    if (this.coaches.length === 0) {
      this.notificationService.showError(
        'Aucun coach disponible',
        'Veuillez d\'abord créer des coachs'
      );
      return;
    }

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

    console.log('📤 CourseRegisterForm - Données à envoyer:', courseData);

    this.courseService.createCourse(courseData).subscribe({
      next: (newCourse) => {
        this.loading = false;
        console.log('✅ CourseRegisterForm - Cours créé:', newCourse);

        this.notificationService.showSuccess(
          'Cours créé',
          `Le cours "${courseData.title}" a été créé avec succès`
        );

        this.courseAdded.emit(newCourse);
        this.closeDialog();
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ CourseRegisterForm - Erreur:', error);

        if (error.status === 400) {
          this.notificationService.showError('Données invalides', 'Veuillez vérifier les informations saisies');
        } else if (error.status === 404) {
          this.notificationService.showError('Ressource introuvable', 'Coach ou type de cours introuvable');
        } else {
          this.notificationService.showError('Erreur', 'Une erreur est survenue lors de la création du cours');
        }
      }
    });
  }

  /**
   * ✅ Utilitaire pour déboguer les erreurs
   */
  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.courseForm.controls).forEach(key => {
      const control = this.courseForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}
