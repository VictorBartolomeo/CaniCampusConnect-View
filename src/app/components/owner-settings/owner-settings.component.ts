import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {UserService} from '../../service/user.service';
import {MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {InputMaskModule} from 'primeng/inputmask';
import {PasswordModule} from 'primeng/password';
import {CardModule} from 'primeng/card';
import {ToastModule} from 'primeng/toast';
import {CommonModule} from '@angular/common';
import {Owner} from '../../models/owner';

@Component({
  selector: 'app-owner-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    PasswordModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './owner-settings.component.html',
  styleUrl: './owner-settings.component.scss'
})
export class UserSettingsComponent implements OnInit {
  userForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = false;
  owner: Owner | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
  }

  initForms(): void {
    // Formulaire des informations utilisateur (Owner)
    this.userForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: ['']
    });

    // Formulaire de changement de mot de passe
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {validators: this.checkPasswords});
  }

  // Validation personnalisée pour vérifier que les mots de passe correspondent
  checkPasswords(group: FormGroup) {
    const pass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : {notSame: true};
  }

  loadUserData(): void {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (owner) => {
        this.owner = owner;
        this.userForm.patchValue({
          firstname: owner.firstname,
          lastname: owner.lastname,
          email: owner.email,
          phone: owner.phone || '',
          address: owner.address || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les informations utilisateur'
        });
        this.loading = false;
        console.error('Erreur lors du chargement des données utilisateur:', error);
      }
    });
  }

  onUserFormSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      this.userService.updateUser(this.userForm.value).subscribe({
        next: (updatedOwner) => {
          this.owner = updatedOwner;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Informations mises à jour avec succès'
          });
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de mettre à jour les informations'
          });
          this.loading = false;
          console.error('Erreur lors de la mise à jour des données:', error);
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez corriger les erreurs dans le formulaire'
      });
    }
  }

  onPasswordFormSubmit(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      const {currentPassword, newPassword} = this.passwordForm.value;

      this.userService.updatePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Mot de passe mis à jour avec succès'
          });
          this.passwordForm.reset();
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de mettre à jour le mot de passe'
          });
          this.loading = false;
          console.error('Erreur lors de la mise à jour du mot de passe:', error);
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez corriger les erreurs dans le formulaire'
      });
    }
  }
}
