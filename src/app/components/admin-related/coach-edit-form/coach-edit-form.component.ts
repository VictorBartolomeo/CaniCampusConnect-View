
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '../../../service/notifications.service';
import { CoachService } from '../../../service/coach.service';
import { UserService } from '../../../service/user.service';
import { AuthStateService } from '../../../service/auth-state.service';

// Import validators
import { EmailValidator } from '../../../service/validators/email-validator';
import { PhoneValidator } from '../../../service/validators/phone-validator';
import { NameValidator } from '../../../service/validators/name-validator';

@Component({
  selector: 'app-coach-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    TooltipModule
  ],
  templateUrl: './coach-edit-form.component.html',
  styleUrl: './coach-edit-form.component.scss'
})
export class CoachEditFormComponent implements OnInit, OnChanges {
  @Input() coach: any = null;
  @Input() visible: boolean = false;
  @Input() adminMode: boolean = false; // ✅ Nouveau : Pour différencier admin vs self-edit

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() coachUpdated = new EventEmitter<any>();

  private formBuilder = inject(FormBuilder);
  private coachService = inject(CoachService);
  private userService = inject(UserService);
  private authStateService = inject(AuthStateService);
  private notificationService = inject(NotificationService);

  coachEditForm!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  error: string = '';
  isCurrentUser: boolean = false;

  ngOnInit() {
    this.initForm();
    this.checkIfCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['coach'] && changes['coach'].currentValue) {
      if (this.coachEditForm) {
        this.resetForm();
        this.populateForm();
      }
      this.checkIfCurrentUser();
    }

    if (changes['visible']) {
      this.visibleChange.emit(this.visible);
    }
  }

  /**
   * Vérifier si c'est l'utilisateur actuel qui modifie ses propres infos
   */
  private checkIfCurrentUser(): void {
    const currentUserId = this.authStateService.getUserId();
    const currentRole = this.authStateService.getRole();

    this.isCurrentUser = (
      this.coach &&
      currentUserId === this.coach.id &&
      (currentRole === 'ROLE_COACH' || currentRole === 'COACH')
    );
  }

  /**
   * Initialize the form with validators
   */
  private initForm(): void {
    this.coachEditForm = this.formBuilder.group({
      firstname: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100),
        NameValidator.validName()
      ]],
      lastname: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100),
        NameValidator.validName()
      ]],
      email: ['', [
        Validators.required,
        Validators.maxLength(150),
        EmailValidator.validEmail()
      ]],
      phone: ['', [
        Validators.maxLength(50),
        PhoneValidator.validPhone()
      ]],
      acacedNumber: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]]
    });

    if (this.coach) {
      this.populateForm();
    }
  }

  /**
   * Populate the form with coach data
   */
  private populateForm(): void {
    if (!this.coach) return;

    this.coachEditForm.patchValue({
      firstname: this.coach.firstname || '',
      lastname: this.coach.lastname || '',
      email: this.coach.email || '',
      phone: this.coach.phone || '',
      acacedNumber: this.coach.acacedNumber || ''
    });
  }

  /**
   * Reset the form and error state
   */
  resetForm(): void {
    this.coachEditForm.reset();
    this.error = '';
    this.submitted = false;
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  /**
   * Get form controls for easier access in the template
   */
  get f() {
    return this.coachEditForm.controls;
  }

  /**
   * Submit the form to update the coach
   */
  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.coachEditForm.invalid) {
      this.notificationService.showError(
        'Échec',
        'Veuillez corriger les erreurs du formulaire avant de continuer'
      );
      return;
    }

    this.loading = true;

    const updateData = {
      id: this.coach.id,
      firstname: this.coachEditForm.get('firstname')?.value.trim(),
      lastname: this.coachEditForm.get('lastname')?.value.trim(),
      email: this.coachEditForm.get('email')?.value.trim(),
      phone: this.coachEditForm.get('phone')?.value?.trim() || null,
      acacedNumber: this.coachEditForm.get('acacedNumber')?.value.trim()
    };

    // ✅ Choisir le service selon le contexte
    const updateObservable = this.isCurrentUser
      ? this.userService.updateUser(updateData)  // Coach modifie ses propres infos
      : this.coachService.updateCoach(updateData); // Admin modifie un coach

    updateObservable.subscribe({
      next: (updatedCoach) => {
        this.loading = false;
        this.notificationService.showSuccess(
          'Mise à jour réussie',
          'Les informations du coach ont été mises à jour avec succès.'
        );
        this.coachUpdated.emit(updatedCoach);
        this.closeDialog();
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors de la mise à jour:', error);

        if (error.status === 409) {
          this.error = "Un compte avec cet email existe déjà";
          this.notificationService.showError('Erreur', "Un compte avec cet email existe déjà");
        } else if (error.status === 400) {
          this.error = "Données invalides";
          this.notificationService.showError('Erreur de validation', "Veuillez vérifier les informations saisies");
        } else {
          this.error = "Une erreur est survenue lors de la mise à jour du compte";
          this.notificationService.showError('Erreur', "Une erreur est survenue lors de la mise à jour du compte");
        }
      }
    });
  }
}
