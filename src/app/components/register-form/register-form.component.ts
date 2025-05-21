import { Component, inject } from '@angular/core';
import { Card } from 'primeng/card';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { NgClass } from '@angular/common';
import { Password } from 'primeng/password';
import { PrimeTemplate } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Checkbox } from 'primeng/checkbox';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-register-form',
  imports: [
    Button,
    Card,
    FormsModule,
    InputText,
    NgClass,
    Password,
    PrimeTemplate,
    ReactiveFormsModule,
    RouterLink,
    IconField,
    InputIcon,
    Checkbox
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent {
  formBuilder = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  auth = inject(AuthService);

  loading = false;
  submitted = false;
  error = '';

  // Regex pour la validation du mot de passe fort
  private strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Formulaire de création de compte
  registerForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    firstname: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    phone: ['', [Validators.pattern(/^\+[0-9]{10,15}$/)]],
    password: ['', [Validators.required, this.strongPasswordValidator()]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  }, {
    validators: [this.passwordMatchValidator]
  });

  get f() {
    return this.registerForm.controls;
  }

  // Validateur personnalisé pour un mot de passe fort
  strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Ne pas valider si vide (c'est le rôle de required)
      }
      const valid = this.strongPasswordRegex.test(control.value);
      return valid ? null : { strongPassword: true };
    };
  }

  // Validateur pour vérifier que les mots de passe correspondent
  passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onRegister() {
    this.submitted = true;
    this.error = '';

    if (this.registerForm.invalid) {
      return;
    }

    // Vérifier que les CGU sont acceptées (double vérification)
    if (!this.registerForm.get('acceptTerms')?.value) {
      this.error = "Vous devez accepter les conditions générales d'utilisation";
      return;
    }

    this.loading = true;

    // Créer l'objet à envoyer à l'API (sans le confirmPassword et acceptTerms)
    const registerData = {
      email: this.registerForm.get('email')?.value,
      firstname: this.registerForm.get('firstname')?.value,
      lastname: this.registerForm.get('lastname')?.value,
      phone: this.registerForm.get('phone')?.value || null, // Envoyer null si vide
      password: this.registerForm.get('password')?.value
    };

    // Envoi des données à l'API
    this.http.post("http://localhost:8080/owner/register", registerData).subscribe({
      next: response => {
        this.loading = false;
        // Redirection vers la page de connexion avec un message de succès
        this.router.navigateByUrl('/login');
      },
      error: error => {
        this.loading = false;
        if (error.status === 409) {
          this.error = "Un compte avec cet email existe déjà";
        } else {
          this.error = "Une erreur est survenue lors de la création du compte";
        }
      }
    });
  }
}
