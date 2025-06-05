import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  router = inject(Router);
  private apiUrl = 'http://localhost:8080';
  private darkMode: boolean = false;

  constructor(
    private http: HttpClient,
    private authStateService: AuthStateService,
    private userService: UserService
  ) {
    const jwt = localStorage.getItem('jwt');
    if (jwt != null) {
      this.decodeJwt(jwt);
    }

    // Charger la préférence de thème
    this.loadThemePreference();
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
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {email, password}, {responseType: 'text'}).pipe(
      map(token => {
        if (token) {
          this.decodeJwt(token);
          return {success: true, token};
        }
        return null; // Gestion du cas où token est falsy
      }),
      catchError(error => {
        console.error('Erreur de connexion:', error);
        return of(null);
      })
    );
  }

  // Décodage du JWT
  decodeJwt(jwt: string) {
    localStorage.setItem('jwt', jwt);
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
    this.userService.clearUserData();
    this.authStateService.clearState();
    this.router.navigateByUrl('/login');
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return this.authStateService.isConnected();
  }

  // Obtenir l'ID de l'utilisateur
  getUserId(): number | null {
    return this.authStateService.getUserId();
  }

  getUserInfo(): Observable<any> {
    return this.userService.getCurrentUser();
  }

  refreshUserInfo(): void {
    const userId = this.authStateService.getUserId();
    if (userId) {
      this.userService.loadOwnerInfo(userId).subscribe();
    }
  }

  // Vérifier l'état du JWT
  checkJwtStatus() {
    const jwt = localStorage.getItem('jwt');

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
