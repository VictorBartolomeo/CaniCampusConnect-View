import {Component, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {NotificationService} from '../../../service/notifications.service';
import {CoachService} from '../../../service/coach.service';

// Import validators
import {PasswordValidator} from '../../../service/validators/password-validator';
import {EmailValidator} from '../../../service/validators/email-validator';
import {PhoneValidator} from '../../../service/validators/phone-validator';
import {NameValidator} from '../../../service/validators/name-validator';
import {PasswordMatchValidator} from '../../../service/validators/password-match-validator';

@Component({
  selector: 'app-coach-register-form',
  standalone: true,
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    PasswordModule,
    DialogModule,
    ButtonModule,
    CommonModule
  ],
  templateUrl: './coach-register-form.component.html',
  styleUrl: './coach-register-form.component.scss'
})
export class CoachRegisterFormComponent implements OnInit {
  // Injection
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private coachService = inject(CoachService);
  private notificationService = inject(NotificationService);

  @Output() coachAdded = new EventEmitter<any>();

  coachRegisterForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  visible = false;

  showDialog() {
    this.coachRegisterForm.reset();
    this.error = '';
    this.submitted = false;
    this.visible = true;
  }

  ngOnInit() {
    this.coachRegisterForm = this.formBuilder.group({
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
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        PasswordValidator.strongPassword()
      ]],
      confirmPassword: ['', Validators.required],
      acacedNumber: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]]
    }, {
      validators: PasswordMatchValidator.passwordsMatch('password', 'confirmPassword')
    });
  }

  get f() {
    return this.coachRegisterForm.controls;
  }

  onRegister() {
    this.submitted = true;
    this.error = '';

    if (this.coachRegisterForm.invalid) {
      this.notificationService.showError(
        'Échec',
        'Veuillez corriger les erreurs du formulaire avant de continuer'
      );
      return;
    }

    this.loading = true;

    const registerData = {
      email: this.coachRegisterForm.get('email')?.value.trim(),
      firstname: this.coachRegisterForm.get('firstname')?.value.trim(),
      lastname: this.coachRegisterForm.get('lastname')?.value.trim(),
      phone: this.coachRegisterForm.get('phone')?.value?.trim() || null,
      password: this.coachRegisterForm.get('password')?.value,
      acacedNumber: this.coachRegisterForm.get('acacedNumber')?.value.trim()
    };

    this.coachService.registerCoach(registerData).subscribe({
      next: response => {
        this.loading = false;
        this.notificationService.showSuccess(
          'Inscription réussie',
          'Le compte coach a été créé avec succès.'
        );
        this.coachRegisterForm.reset();
        this.submitted = false;
        this.visible = false;
        this.coachAdded.emit(response);
      },
      error: error => {
        this.loading = false;

        if (error.status === 409) {
          this.error = "Un compte avec cet email existe déjà";
          this.notificationService.showError(
            'Erreur',
            "Un compte avec cet email existe déjà"
          );
        } else if (error.status === 400) {
          this.error = "Données invalides";
          this.notificationService.showError(
            'Erreur de validation',
            "Veuillez vérifier les informations saisies"
          );
        } else {
          this.error = "Une erreur est survenue lors de la création du compte";
          this.notificationService.showError(
            'Erreur',
            "Une erreur est survenue lors de la création du compte"
          );
        }
      }
    });
  }
}
