import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, BehaviorSubject, tap, Subject} from 'rxjs';
import { Registration } from '../models/registration';
import { Course } from '../models/course';
import { AuthStateService } from './auth-state.service';
import {API_CONFIG_URL} from '../../environments/environment.development';
import {RegistrationStatus} from '../models/registrationstatus.enum';

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

  // Subject pour les notifications en temps réel
  private pendingCountSubject = new BehaviorSubject<number>(0);
  public pendingCount$ = this.pendingCountSubject.asObservable();

  // ✅ AJOUT : Subject pour notifier les mises à jour de cours
  private courseUpdatedSubject = new Subject<number>();
  public courseUpdated$ = this.courseUpdatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authStateService: AuthStateService
  ) {}

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
    const body = { status: status };
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
}
