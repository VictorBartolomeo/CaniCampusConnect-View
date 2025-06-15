import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private authStateService = inject(AuthStateService);

  private apiUrl = 'http://localhost:8080';
  private darkMode: boolean = false;

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const jwt = this.getToken();
    if (jwt != null && this.checkJwtStatus()) {
      this.decodeJwt(jwt);
    }
    this.loadThemePreference();

    // ✅ CORRECTION : Ne plus injecter directement UserService et DogService
    // Ces services s'initialiseront automatiquement via leurs observables
  }

  // Méthode pour charger la préférence de thème
  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('darkMode');
    this.darkMode = savedTheme === 'true';
    this.applyTheme();
  }

  // Méthode pour appliquer le thème
  private applyTheme(): void {
    const element = document.querySelector('html');
    if (this.darkMode) {
      element?.classList.add('my-app-dark');
    } else {
      element?.classList.remove('my-app-dark');
    }
  }

  // Méthode pour basculer le thème
  toggleDarkMode(): boolean {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyTheme();
    return this.darkMode;
  }

  // Méthode pour vérifier si le thème sombre est actif
  isDarkMode(): boolean {
    return this.darkMode;
  }

  // Getters qui utilisent le service d'état
  get connected(): boolean {
    return this.authStateService.isConnected();
  }

  get role(): string | null {
    return this.authStateService.getRole();
  }

  get userId(): number | null {
    return this.authStateService.getUserId();
  }

  // Méthode de connexion
  login(email: string, password: string, rememberMe: boolean = false): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {email, password}, {responseType: 'text'}).pipe(
      map(token => {
        if (token) {
          this.setToken(token, rememberMe);
          this.decodeJwt(token);
          return {success: true, token};
        }
        return null;
      }),
      catchError(error => {
        console.error('Erreur de connexion:', error);
        return of(null);
      })
    );
  }

  redirectToDashboard(): void {
    const userRole = this.authStateService.getRole();

    switch (userRole) {
      case 'ROLE_OWNER':
        this.router.navigateByUrl('/dashboard');
        break;
      case 'ROLE_COACH':
        this.router.navigateByUrl('/coach/dashboard');
        break;
      case 'ROLE_CLUB_OWNER':
        this.router.navigateByUrl('/admin/dashboard');
        break;
      default:
        console.warn('Rôle non reconnu:', userRole);
        this.router.navigateByUrl('/login');
        break;
    }
  }

  // Décodage du JWT
  decodeJwt(jwt: string) {
    try {
      const jsonBody = atob(jwt.split('.')[1]);
      const body = JSON.parse(jsonBody);
      console.log('JWT décodé:', body);

      // Mettre à jour l'état d'authentification
      this.authStateService.setRole(body.role);
      this.authStateService.setUserId(body.userId);
      this.authStateService.setConnected(true);
    } catch (e) {
      console.error('Erreur lors du décodage du JWT:', e);
      this.disconnection();
    }
  }

  // Déconnexion
  disconnection() {
    localStorage.removeItem('jwt');
    sessionStorage.removeItem('jwt');
    sessionStorage.clear();

    // ✅ CORRECTION : Clear via AuthStateService qui notifiera les autres services
    this.authStateService.clearState();

    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    // Vérifier d'abord sessionStorage puis localStorage
    return sessionStorage.getItem('jwt') || localStorage.getItem('jwt');
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return this.authStateService.isConnected();
  }

  // Obtenir l'ID de l'utilisateur
  getUserId(): number | null {
    return this.authStateService.getUserId();
  }

  setToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      localStorage.setItem('jwt', token);
      localStorage.setItem('rememberMe', 'true');
    } else {
      sessionStorage.setItem('jwt', token);
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('jwt');
    }
  }

  // Vérifier l'état du JWT
  checkJwtStatus(): boolean {
    const jwt = this.getToken();

    if (jwt) {
      try {
        const parts = jwt.split('.');
        if (parts.length !== 3) {
          console.error('Format JWT invalide');
          return false;
        }

        const payload = JSON.parse(atob(parts[1]));
        const now = Date.now() / 1000;
        if (payload.exp && payload.exp < now) {
          console.error('JWT expiré');
          return false;
        }

        return true;
      } catch (e) {
        console.error('Erreur lors de l\'analyse du JWT:', e);
        return false;
      }
    }

    return false;
  }
}
