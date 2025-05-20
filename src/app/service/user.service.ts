import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {Owner} from '../models/owner';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private apiUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
  }

  // Récupérer les informations de l'utilisateur (Owner) connecté
  getCurrentUser(): Observable<Owner> {
    const userId = this.authService.getUserId();
    return this.http.get<Owner>(`${this.apiUrl}/owner/${userId}`);
  }

  // Mettre à jour les informations de l'utilisateur (Owner)
  updateUser(owner: Partial<Owner>): Observable<Owner> {
    const userId = this.authService.getUserId();
    return this.http.put<Owner>(`${this.apiUrl}/user/${userId}`, owner);
  }

  // Mettre à jour le mot de passe (à implémenter selon votre API)
  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.put(`${this.apiUrl}/owner/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }
}
