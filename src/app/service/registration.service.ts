import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Registration } from '../models/registration';
import {RegistrationStatus} from '../models/registrationstatus.enum';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = 'http://localhost:8080/api/registrations'; // Ajustez si votre endpoint est différent

  constructor(private http: HttpClient) { }

  updateRegistrationStatus(registrationId: number, status: RegistrationStatus): Observable<Registration> {
    if (!registrationId) {
      return throwError(() => new Error('Registration ID cannot be null or undefined.'));
    }

    return this.http.put<Registration>(`${this.apiUrl}/${registrationId}/status`, { status }).pipe(
      tap(updatedRegistration => console.log(`Registration ${registrationId} status updated to ${status}`, updatedRegistration)),
      catchError(error => {
        console.error(`Error updating registration status for ${registrationId}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Potentiellement d'autres méthodes liées aux inscriptions si nécessaire
}
