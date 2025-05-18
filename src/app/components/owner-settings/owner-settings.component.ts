import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../service/user.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { Owner } from '../../models/owner';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

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
    InputIcon
  ],
  providers: [MessageService],
  templateUrl: './owner-settings.component.html',
  styleUrl: './owner-settings.component.scss'
})
export class OwnerSettingsComponent implements OnInit {
  userForm!: FormGroup;
  loading = false;
  owner: Owner | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService
  ) {}

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

  onSubmit(): void {
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
}
