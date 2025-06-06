import {Component} from '@angular/core';
import {ButtonDirective} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {Router, RouterLink} from '@angular/router';
import {NgClass, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../service/auth.service';
import {PasswordModule} from 'primeng/password';
import {Card} from 'primeng/card';


@Component({
  selector: 'app-login-form',
  imports: [
    InputText,
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    PasswordModule,
    Card,
    NgClass,
    ButtonDirective
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', Validators.required]
    });

    if (this.authService.isAuthenticated()) {
      this.redirectToDashboardByRole();
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onConnection() {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.redirectToDashboardByRole();
          } else {
            this.error = 'Échec de connexion, vérifiez vos identifiants';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Erreur détaillée:', error);
          if (error.status === 401) {
            this.error = 'Identifiants incorrects';
          } else if (error.status === 0) {
            this.error = 'Serveur inaccessible. Veuillez réessayer plus tard.';
          } else {
            this.error = error.error || 'Une erreur est survenue';
          }
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
  private redirectToDashboardByRole(): void {
    const userRole = this.authService.role; // AuthService a un getter 'role' qui utilise AuthStateService

    if (userRole === "ROLE_COACH") {
      this.router.navigateByUrl('/coach/dashboard');
    } else if (userRole === "ROLE_OWNER") {
      this.router.navigateByUrl('/dashboard');
    } else if (userRole === "ROLE_CLUBOWNER") {
      // Assurez-vous que la route '/clubowner/dashboard' est définie dans app.routes.ts
      this.router.navigateByUrl('/clubowner/dashboard');
    } else {
      console.warn(`Rôle utilisateur non géré ('${userRole}') ou absent. Redirection vers la page de connexion ou un dashboard par défaut.`);
      this.router.navigateByUrl('/login');
    }
  }


}

