import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CoachService, CoachResponse } from './coach.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private coachesSubject = new BehaviorSubject<any[]>([]);
  public coaches$ = this.coachesSubject.asObservable();

  constructor(private coachService: CoachService) {}

  /**
   * Load all coaches and update the observable
   */
  loadCoaches(): Observable<any[] | CoachResponse> {
    return this.coachService.getAllCoaches().pipe(
      tap((response: any[] | CoachResponse) => {
        let coaches: any[] = [];

        // Handle different possible response formats
        if (Array.isArray(response)) {
          // Response is already an array
          coaches = response;
        } else if (response && typeof response === 'object') {
          // Response might be wrapped in an object
          if (Array.isArray(response.data)) {
            coaches = response.data;
          } else if (Array.isArray(response.content)) {
            coaches = response.content;
          } else if (Array.isArray(response.coaches)) {
            coaches = response.coaches;
          } else {
            // If we can't find an array property, try to convert the object to an array
            const possibleArray = Object.values(response).find(val => Array.isArray(val));
            if (possibleArray) {
              coaches = possibleArray;
            } else {
              console.error('Could not extract coaches array from response:', response);
              coaches = [];
            }
          }
        } else {
          console.error('Unexpected response format:', response);
          coaches = [];
        }

        this.coachesSubject.next(coaches);
      })
    );
  }

  /**
   * Add a new coach and update the observable
   */
  addCoach(coachData: any): Observable<any> {
    return this.coachService.registerCoach(coachData).pipe(
      tap(newCoach => {
        const currentCoaches = this.coachesSubject.getValue();
        this.coachesSubject.next([...currentCoaches, newCoach]);
      })
    );
  }

  /**
   * Update a coach and update the observable
   */
  updateCoach(coachData: any): Observable<any> {
    return this.coachService.updateCoach(coachData).pipe(
      tap(updatedCoach => {
        const currentCoaches = this.coachesSubject.getValue();
        const index = currentCoaches.findIndex(c => c.id === updatedCoach.id);
        if (index !== -1) {
          const updatedCoaches = [...currentCoaches];
          updatedCoaches[index] = updatedCoach;
          this.coachesSubject.next(updatedCoaches);
        }
      })
    );
  }

  /**
   * Get the current value of coaches
   */
  getCoaches(): any[] {
    return this.coachesSubject.getValue();
  }

  /**
   * Delete a coach and update the observable
   * @param coachId The ID of the coach to delete
   */
  deleteCoach(coachId: number): Observable<any> {
    return this.coachService.deleteCoach(coachId).pipe(
      tap(() => {
        const currentCoaches = this.coachesSubject.getValue();
        const updatedCoaches = currentCoaches.filter(coach => coach.id !== coachId);
        this.coachesSubject.next(updatedCoaches);
      })
    );
  }
}
