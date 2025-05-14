import {catchError, map, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  connected = false;
  role: string | null = null;
  userId: number | null = null;
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
    const jwt = localStorage.getItem('jwt');
    if (jwt != null) {
      this.decodeJwt(jwt);
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, { responseType: 'text' }).pipe(
      map(token => {
        if (token) {
          this.decodeJwt(token);
          return { success: true, token };
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
      this.userId = body.id || body.userId || body.sub; // Essaie différentes propriétés courantes pour l'ID
      this.connected = true;
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
  }

  // Méthode pour vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return this.connected;
  }

  // Méthode pour obtenir l'ID de l'utilisateur
  getUserId(): number | null {
    return this.userId;
  }

  checkJwtStatus() {
    const jwt = localStorage.getItem('jwt');
    console.log('JWT dans localStorage:', jwt ? 'Présent' : 'Absent');
    console.log('Statut de connexion:', this.connected);
    console.log('Rôle utilisateur:', this.role);
    console.log('ID utilisateur:', this.userId);

    if (jwt) {
      try {
        // Vérifier si le JWT est bien formé
        const parts = jwt.split('.');
        if (parts.length !== 3) {
          console.error('Format JWT invalide');
          return false;
        }

        // Vérifier la validité du JWT (expiration)
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
