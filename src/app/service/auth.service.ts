import {catchError, map, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Owner} from '../models/user';
import {Router} from '@angular/router';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  router = inject(Router);
  connected = false;
  role: string | null = null;
  userId: number | null = null;
  darkMode: boolean = false;
  private apiUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
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

  decodeJwt(jwt: string) {
    localStorage.setItem('jwt', jwt);
    try {
      const jsonBody = atob(jwt.split('.')[1]);
      const body = JSON.parse(jsonBody);
      console.log('JWT décodé:', body);

      this.role = body.role;
      this.userId = body.userId;
      this.connected = true;

      // Charger les informations du propriétaire dès la connexion
      if (this.userId) {
        this.userService.loadOwnerInfo(this.userId).subscribe();
      }
    } catch (e) {
      console.error('Erreur lors du décodage du JWT:', e);
      this.disconnection();
    }
  }

  disconnection() {
    localStorage.removeItem('jwt');
    this.connected = false;
    this.role = null;
    this.userId = null;
    this.userService.clearUserData();
    this.router.navigateByUrl('/login');
  }

  isAuthenticated(): boolean {
    return this.connected;
  }

  getUserId(): number | null {
    return this.userId;
  }

  getUserInfo(): Observable<Owner> {
    return this.userService.loadOwnerInfo(this.userId) as Observable<Owner>;
  }

  getUserFullName(): string {
    return this.userService.getFullName();
  }

  refreshUserInfo(): void {
    this.userService.loadOwnerInfo(this.userId).subscribe();
  }

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
