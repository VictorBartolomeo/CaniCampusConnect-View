import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import {AdminService} from '../../../../service/admin.service';
import {AuthStateService} from '../../../../service/auth-state.service';
import {NotificationService} from '../../../../service/notifications.service';
import {NameValidator} from '../../../../service/validators/name-validator';
import {EmailValidator} from '../../../../service/validators/email-validator';
import {PhoneValidator} from '../../../../service/validators/phone-validator';

@Component({
  selector: 'app-user-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    DropdownModule
  ],
  templateUrl: './user-edit-form-component.component.html',
  styleUrl: './user-edit-form-component.component.scss'
})
export class UserEditFormComponent implements OnInit, OnChanges {
  @Input() user: any = null;
  @Input() visible: boolean = false;
  @Input() adminMode: boolean = true; // ✅ Toujours true pour ce composant admin

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() userUpdated = new EventEmitter<any>();

  private formBuilder = inject(FormBuilder);
  private adminService = inject(AdminService); // ✅ CHANGÉ : AdminService
  private authStateService = inject(AuthStateService);
  private notificationService = inject(NotificationService);

  userEditForm!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  error: string = '';

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('🔍 ngOnChanges called with changes:', changes);

    if (changes['user'] && changes['user'].currentValue) {
      console.log('🔍 User changed to:', changes['user'].currentValue);

      if (this.userEditForm) {
        this.resetForm();
        this.populateForm();
      }
    }

    if (changes['visible']) {
      console.log('🔍 Visibility changed to:', changes['visible'].currentValue);
      this.visibleChange.emit(this.visible);
    }
  }

  /**
   * Initialize the form with validators
   */
  private initForm(): void {
    this.userEditForm = this.formBuilder.group({
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
      ]]
    });

    if (this.user) {
      this.populateForm();
    }
  }

  /**
   * Populate the form with user data
   */
  private populateForm(): void {
    console.log('🔍 populateForm called with user:', this.user);

    if (!this.user) {
      console.warn('🔍 No user provided to populateForm');
      return;
    }

    const formValues = {
      firstname: this.user.firstname || '',
      lastname: this.user.lastname || '',
      email: this.user.email || '',
      phone: this.user.phone || ''
    };

    console.log('🔍 Patching form with values:', formValues);
    this.userEditForm.patchValue(formValues);
    console.log('🔍 Form after patching:', this.userEditForm.value);
    console.log('🔍 Form valid:', this.userEditForm.valid);
  }

  /**
   * Reset the form and error state
   */
  resetForm(): void {
    this.userEditForm.reset();
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
    return this.userEditForm.controls;
  }

  /**
   * Submit the form to update the user
   */
  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.userEditForm.invalid) {
      this.notificationService.showError(
        'Échec',
        'Veuillez corriger les erreurs du formulaire avant de continuer'
      );
      return;
    }

    this.loading = true;

    const updateData = {
      id: this.user.id,
      firstname: this.userEditForm.get('firstname')?.value.trim(),
      lastname: this.userEditForm.get('lastname')?.value.trim(),
      email: this.userEditForm.get('email')?.value.trim(),
      phone: this.userEditForm.get('phone')?.value?.trim() || null,
      role: this.user.role, // Garde le rôle existant
      emailValidated: this.user.emailValidated || this.user.validated || true,
      avatarUrl: this.user.avatarUrl || null
    };

    console.log('📤 user-edit-form - Envoi des données:', updateData);
    this.adminService.updateUser(updateData).subscribe({
      next: (updatedUser) => {
        this.loading = false;
        console.log('✅ user-edit-form - Mise à jour réussie:', updatedUser);

        this.notificationService.showSuccess(
          'Mise à jour réussie',
          'Les informations de l\'utilisateur ont été mises à jour avec succès.'
        );
        this.userUpdated.emit(updatedUser);
        this.closeDialog();
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ user-edit-form - Erreur lors de la mise à jour:', error);

        if (error.status === 409) {
          this.error = "Un compte avec cet email existe déjà";
          this.notificationService.showError('Erreur', "Un compte avec cet email existe déjà");
        } else if (error.status === 400) {
          this.error = "Données invalides";
          this.notificationService.showError('Erreur de validation', "Veuillez vérifier les informations saisies");
        } else if (error.status === 403) {
          this.error = "Accès non autorisé";
          this.notificationService.showError('Erreur', "Vous n'avez pas l'autorisation de modifier cet utilisateur");
        } else {
          this.error = "Une erreur est survenue lors de la mise à jour du compte";
          this.notificationService.showError('Erreur', "Une erreur est survenue lors de la mise à jour du compte");
        }
      }
    });
  }
}
