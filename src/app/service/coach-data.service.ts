import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {Course} from '../models/course.d'; // Assurez-vous que le chemin est correct
import {Registration} from '../models/registration.d'; // Si les inscriptions sont imbriquées et ont des dates

@Injectable({
  providedIn: 'root'
})
export class CoachDataService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080';

  constructor() { }
  getCoursesByCoachId(coachId: number): Observable<Course[]> {
    if (!coachId) {
      // Gérer le cas où coachId est null ou undefined pour éviter un appel API inutile
      console.error('Coach ID is required to fetch courses.');
      return throwError(() => new Error('Coach ID is required.'));
    }

    return this.http.get<Course[]>(`${this.apiUrl}/coach/${coachId}/courses/upcoming`).pipe(
      map(courses => courses.map(course => this.transformCourse(course))),
      tap(transformedCourses => console.log(`Fetched ${transformedCourses.length} courses for coach ${coachId}`, transformedCourses)),
      catchError(this.handleError)
    );
  }
  /**
   * Transforme un objet Course brut reçu de l'API.
   * Principalement pour convertir les chaînes de date ISO en objets Date JavaScript.
   * @param course Le cours brut de l'API.
   * @returns Le cours transformé.
   */
  private transformCourse(course: Course): Course {
    return {
      ...course,
      startDatetime: new Date(course.startDatetime),
      endDatetime: new Date(course.endDatetime),
      // Si les inscriptions sont retournées avec les cours et contiennent des dates ou des chiens avec dates
      registrations: Array.isArray(course.registrations)
        ? course.registrations.map(reg => this.transformRegistration(reg))
        : [],
    };
  }

  /**
   * Transforme un objet Registration brut (potentiellement imbriqué dans Course).
   * @param registration L'inscription brute.
   * @returns L'inscription transformée.
   */
  private transformRegistration(registration: Registration): Registration {
    const transformedReg: Registration = { ...registration };
    if (registration.dog && registration.dog.birthDate) {
      transformedReg.dog = {
        ...registration.dog,
        birthDate: new Date(registration.dog.birthDate)
      };
    }
    return transformedReg;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue est survenue!';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client ou réseau
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Le backend a retourné un code d'erreur
      // Le corps de la réponse peut contenir des indices sur ce qui n'a pas fonctionné
      errorMessage = `Code d'erreur ${error.status}: ${error.message || error.error?.message || 'Erreur serveur'}`;
      if (error.status === 404) {
        errorMessage = `Aucun cours trouvé pour ce coach (Code: ${error.status}).`;
      } else if (error.status === 403) {
        errorMessage = `Accès non autorisé aux cours (Code: ${error.status}).`;
      }
    }
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
