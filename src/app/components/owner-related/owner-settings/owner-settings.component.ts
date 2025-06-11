import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserService} from '../../../service/user.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {CardModule} from 'primeng/card';
import {ToastModule} from 'primeng/toast';
import {Owner} from '../../../models/user';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {differenceInDays, differenceInMonths, differenceInYears, format, parseISO} from 'date-fns';
import {fr} from 'date-fns/locale';
import {AuthService} from '../../../service/auth.service';
import {ConfirmDialogModule} from 'primeng/confirmdialog';

@Component({
  selector: 'app-owner-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ToastModule,
    IconField,
    InputIcon,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './owner-settings.component.html',
  styleUrl: './owner-settings.component.scss'
})
export class OwnerSettingsComponent implements OnInit {
  userForm!: FormGroup;
  loading = false;
  owner: Owner | null = null;
  memberSinceText: string = '';
  registrationDateFormatted: string = '';
  authService = inject(AuthService);
  originalEmail: string = '';


  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
  }

  initForm(): void {
    // Regex pour valider le format du numéro de téléphone français
    const phoneRegex = /^(0|\+33)[1-9]([-. ]?[0-9]{2}){4}$/;

    this.userForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(phoneRegex)]],
    });
  }

  getMemberSinceText(registrationDate: string): string {
    if (!registrationDate) return '';

    const regDate = parseISO(registrationDate);
    const now = new Date();

    const years = differenceInYears(now, regDate);
    const totalMonths = differenceInMonths(now, regDate);
    const months = totalMonths % 12;

    this.registrationDateFormatted = format(regDate, 'dd/MM/yyyy', {locale: fr});

    if (totalMonths < 12) {
      return `Membre depuis ${totalMonths} mois`;
    } else {
      let result = `Membre depuis ${years} an${years > 1 ? 's' : ''}`;
      if (months > 0) {
        result += ` et ${months} mois`;
      }
      return result;
    }
  }


  loadUserData(): void {
    this.loading = true;
    this.userService.getCurrentUser<Owner>().subscribe({
      next: (owner) => {
        this.owner = owner;

        this.originalEmail = owner.email || '';
        console.log('Email original stocké:', this.originalEmail);

        if (owner.registrationDate) {
          this.memberSinceText = this.getMemberSinceText(owner.registrationDate);
        }

        this.userForm.patchValue({
          id: this.authService.getUserId(),
          firstname: owner.firstname || '',
          lastname: owner.lastname || '',
          email: owner.email || '',
          phone: owner.phone || '',
        });

        // Force la validation du formulaire après le patch
        this.userForm.updateValueAndValidity();
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


  confirmUpdate(event: Event): void {
    if (this.userForm.valid) {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Êtes-vous sûr de vouloir mettre à jour vos informations personnelles ?',
        header: 'Confirmation de mise à jour',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui, mettre à jour',
        rejectLabel: 'Non, annuler',
        acceptButtonStyleClass: 'p-button-primary',
        rejectButtonStyleClass: 'p-button-outlined',
        accept: () => {
          this.onSubmit();
        },
        reject: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Annulé',
            detail: 'La mise à jour a été annulée',
            life: 1500
          });
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

  onSubmit(): void {
    this.loading = true;

    const currentEmail = this.userForm.value.email || '';
    const emailChanged = currentEmail !== this.originalEmail;

    this.userService.updateUser<Owner>(this.userForm.value).subscribe({
      next: (updatedOwner) => {
        this.owner = updatedOwner;

        // Recalculate membership duration
        if (updatedOwner.registrationDate) {
          this.memberSinceText = this.getMemberSinceText(updatedOwner.registrationDate);
        }

        if (emailChanged) {
          this.messageService.add({
            severity: 'info',
            summary: 'Email modifié',
            detail: 'Votre adresse email a été modifiée. Vous allez être déconnecté dans 3 secondes. Un email de validation a été envoyé à votre nouvelle adresse. Veuillez valider votre email avant de vous reconnecter.',
            sticky: true
          });

          setTimeout(() => {
            this.authService.disconnection();
          }, 3000);
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Informations mises à jour avec succès'
          });
        }

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
  }
}
