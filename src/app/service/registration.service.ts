import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, BehaviorSubject, tap, Subject, throwError, of} from 'rxjs';
import { Registration } from '../models/registration';
import { Course } from '../models/course';
import { AuthStateService } from './auth-state.service';
import {API_CONFIG_URL} from '../../environments/environment.development';
import {RegistrationStatus} from '../models/registrationstatus.enum';
import {catchError} from 'rxjs/operators';

export interface CourseWithPendingRegistrations {
  course: Course;
  pendingRegistrations: Registration[];
  pendingCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = API_CONFIG_URL.apiUrl;
  private http = inject(HttpClient)
  private authStateService = inject(AuthStateService)

  private pendingCountSubject = new BehaviorSubject<number>(0);
  public pendingCount$ = this.pendingCountSubject.asObservable();

  private courseUpdatedSubject = new Subject<number>();
  public courseUpdated$ = this.courseUpdatedSubject.asObservable();

  createRegistration(dogId: number, courseId: number): Observable<Registration> {
    const registrationData = {
      dog: {id: dogId},
      course: {id: courseId}
    };

    return this.http.post<Registration>(`${this.apiUrl}/registration`, registrationData);
  }


  /**
   * Récupère toutes les registrations en attente pour un coach
   */
  getPendingRegistrations(coachId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.apiUrl}/coach/${coachId}/pending-registrations`)
      .pipe(
        tap(registrations => {
          this.updatePendingCount(registrations.length);
        })
      );
  }

  /**
   * Met à jour le statut d'une registration
   */
  updateRegistrationStatus(registrationId: number, status: RegistrationStatus): Observable<Registration> {
    const body = {status: status};
    return this.http.patch<Registration>(`${this.apiUrl}/registrations/${registrationId}/status`, body)
      .pipe(
        tap(updatedRegistration => {
          // ✅ AJOUT : Notifier que le cours a été mis à jour
          this.notifyCourseUpdate(updatedRegistration.course.id);
        })
      );
  }

  /**
   * ✅ NOUVELLE MÉTHODE : Notifie qu'un cours a été mis à jour
   */
  private notifyCourseUpdate(courseId: number): void {
    this.courseUpdatedSubject.next(courseId);
  }

  /**
   * Rafraîchit le compteur de demandes en attente
   */
  refreshPendingCount(): void {
    const coachId = this.authStateService.getUserId();
    if (coachId) {
      this.getPendingRegistrations(coachId).subscribe();
    }
  }

  /**
   * Met à jour le compteur de demandes en attente
   */
  private updatePendingCount(count: number): void {
    this.pendingCountSubject.next(count);
  }

  /**
   * Récupère le nombre actuel de demandes en attente
   */
  getCurrentPendingCount(): number {
    return this.pendingCountSubject.getValue();
  }

  /**
   * ✅ Obtient le nombre de registrations pour un cours
   */
  getRegistrationsCount(courseId: number): Observable<number> {
    console.log('🔄 CourseService.getRegistrationsCount() - Course ID:', courseId);
    return this.http.get<number>(`${this.apiUrl}/course/${courseId}/registrations/count`).pipe(
      tap(count => {
        console.log('✅ CourseService.getRegistrationsCount() - Count:', count);
      }),
      catchError(error => {
        console.error('❌ CourseService.getRegistrationsCount() - Error:', error);
        return of(0);
      })
    );
  }



  /**
   * ✅ Obtient les inscriptions d'un cours
   * Note: Cette méthode peut nécessiter un endpoint spécifique dans votre backend
   */
  getRegistrationsByCourseId(courseId: number): Observable<any[]> {
    console.log('🔄 RegistrationService.getRegistrationsByCourseId() - Course ID:', courseId);
    return this.http.get<any[]>(`${this.apiUrl}/course/${courseId}/registrations`).pipe(
      tap(registrations => {
        console.log('✅ RegistrationService.getRegistrationsByCourseId() - Registrations:', registrations);
      }),
      catchError(error => {
        console.error('❌ RegistrationService.getRegistrationsByCourseId() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Annule une inscription
   */
  cancelRegistration(registrationId: number): Observable<any> {
    console.log('🔄 RegistrationService.cancelRegistration() - Registration ID:', registrationId);
    return this.http.delete(`${this.apiUrl}/registration/${registrationId}`).pipe(
      tap(() => {
        console.log('✅ RegistrationService.cancelRegistration() - Registration cancelled');
      }),
      catchError(error => {
        console.error('❌ RegistrationService.cancelRegistration() - Error:', error);
        return throwError(() => error);
      })
    );
  }
}
