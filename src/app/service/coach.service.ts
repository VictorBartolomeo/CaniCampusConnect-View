import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  getAllCoaches(): Observable<any[] | CoachResponse> {
    console.log('Calling API:', `${this.apiUrl}/coachs`);
    return this.http.get<any[] | CoachResponse>(`${this.apiUrl}/coachs`);
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
