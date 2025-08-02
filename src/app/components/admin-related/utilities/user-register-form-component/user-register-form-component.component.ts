
import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { HttpClient } from '@angular/common/http';
import {NotificationService} from '../../../../service/notifications.service';
import {NameValidator} from '../../../../service/validators/name-validator';
import {EmailValidator} from '../../../../service/validators/email-validator';
import {PhoneValidator} from '../../../../service/validators/phone-validator';
import {PasswordValidator} from '../../../../service/validators/password-validator';
import {PasswordMatchValidator} from '../../../../service/validators/password-match-validator';

@Component({
  selector: 'app-user-register-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    DropdownModule,
    PasswordModule,
    CheckboxModule
  ],
  templateUrl: './user-register-form-component.component.html',
  styleUrl: './user-register-form-component.component.scss'
})
export class UserRegisterFormComponent implements OnInit {
  @Output() userAdded = new EventEmitter<any>();

  private formBuilder = inject(FormBuilder);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  private apiUrl = 'http://localhost:8080';

  userRegisterForm!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  error: string = '';
  visible: boolean = false;

  // Options pour le rôle
  roleOptions: any[] = [
    { label: 'Propriétaire', value: 'ROLE_OWNER' },
    { label: 'Coach', value: 'ROLE_COACH' },
    { label: 'Administrateur', value: 'ROLE_CLUB_OWNER' }
  ];

  ngOnInit() {
    this.initForm();
  }

  /**
   * Initialize the form with validators
   */
  private initForm(): void {
    this.userRegisterForm = this.formBuilder.group({
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
      role: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        PasswordValidator.strongPassword()
      ]],
      confirmPassword: ['', Validators.required],
      sendWelcomeEmail: [true]
    }, {
      validators: PasswordMatchValidator.passwordsMatch('password', 'confirmPassword')
    });
  }

  /**
   * Show the dialog
   */
  showDialog(): void {
    this.visible = true;
    this.resetForm();
  }

  /**
   * Reset the form and error state
   */
  resetForm(): void {
    this.userRegisterForm.reset();
    this.userRegisterForm.patchValue({
      sendWelcomeEmail: true
    });
    this.error = '';
    this.submitted = false;
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this.visible = false;
  }

  /**
   * Get form controls for easier access in the template
   */
  get f() {
    return this.userRegisterForm.controls;
  }

  /**
   * Submit the form to create a new user
   */
  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.userRegisterForm.invalid) {
      this.notificationService.showError(
        'Échec',
        'Veuillez corriger les erreurs du formulaire avant de continuer'
      );
      return;
    }

    this.loading = true;

    const registerData = {
      firstname: this.userRegisterForm.get('firstname')?.value.trim(),
      lastname: this.userRegisterForm.get('lastname')?.value.trim(),
      email: this.userRegisterForm.get('email')?.value.trim(),
      phone: this.userRegisterForm.get('phone')?.value?.trim() || null,
      role: this.userRegisterForm.get('role')?.value,
      password: this.userRegisterForm.get('password')?.value,
      sendWelcomeEmail: this.userRegisterForm.get('sendWelcomeEmail')?.value
    };

    // Déterminer l'endpoint selon le rôle
    let endpoint = '';
    switch (registerData.role) {
      case 'ROLE_OWNER':
        endpoint = 'owner/register';
        break;
      case 'ROLE_COACH':
        endpoint = 'coach/register';
        break;
      case 'ROLE_CLUB_OWNER':
        endpoint = 'admin/register';
        break;
      default:
        this.error = 'Rôle non valide';
        this.loading = false;
        return;
    }

    this.http.post(`${this.apiUrl}/${endpoint}`, registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.showSuccess(
          'Utilisateur créé',
          'Le nouvel utilisateur a été créé avec succès.'
        );
        this.userAdded.emit(response);
        this.closeDialog();
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors de la création:', error);

        if (error.status === 409) {
          this.error = "Un compte avec cet email existe déjà";
          this.notificationService.showError('Erreur', "Un compte avec cet email existe déjà");
        } else if (error.status === 400) {
          this.error = "Données invalides";
          this.notificationService.showError('Erreur de validation', "Veuillez vérifier les informations saisies");
        } else {
          this.error = "Une erreur est survenue lors de la création du compte";
          this.notificationService.showError('Erreur', "Une erreur est survenue lors de la création du compte");
        }
      }
    });
  }
}
