import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

export interface CoachResponse {
  data?: any[];
  content?: any[];
  coaches?: any[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private apiUrl = 'http://localhost:8080';
  private http = inject(HttpClient);

  /**
   * Get all coaches
   * @returns Observable with the list of coaches or a response containing coaches
   */
  getAllCoaches(): Observable<any[]> {
    console.log('🔄 CoachService.getAllCoaches()');
    return this.http.get<any>(`${this.apiUrl}/coaches`).pipe(
      map((response: any) => {
        // Si la réponse est un objet avec une propriété data/coaches, l'extraire
        if (response && Array.isArray(response)) {
          return response;
        } else if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response && response.coaches && Array.isArray(response.coaches)) {
          return response.coaches;
        }
        // Sinon, retourner un tableau vide
        return [];
      }),
      tap(coaches => {
        console.log('✅ CoachService.getAllCoaches() - Coaches loaded:', coaches);
      }),
      catchError(error => {
        console.error('❌ CoachService.getAllCoaches() - Error:', error);
        return throwError(() => error);
      })
    );
  }


  /**
   * Get coach details by ID
   * @param id Coach ID
   * @returns Observable with coach details
   */
  getCoachById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/coach/${id}`);
  }

  /**
   * Register a new coach
   * @param coachData Coach data to register
   * @returns Observable with the registered coach
   */
  registerCoach(coachData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/coach/register`, coachData);
  }

  /**
   * Update an existing coach
   * @param coachData Coach data to update
   * @returns Observable with the updated coach
   */
  updateCoach(coachData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/coach/${coachData.id}`, coachData);
  }

  /**
   * Delete a coach by ID
   * @param id Coach ID
   * @returns Observable with the operation result
   */
  deleteCoach(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/coach/${id}`);
  }
}
