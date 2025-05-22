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

  getCurrentUser(): Observable<Owner> {
    const userId = this.authService.getUserId();
    return this.http.get<Owner>(`${this.apiUrl}/owner/${userId}`);
  }

  updateUser(owner: Partial<Owner>): Observable<Owner> {
    const userId = this.authService.getUserId();
    return this.http.put<Owner>(`${this.apiUrl}/owner/${userId}`, owner);
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.put(`${this.apiUrl}/owner/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }
}
