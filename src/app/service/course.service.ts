
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_CONFIG_URL } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = API_CONFIG_URL.apiUrl;

  /**
   * ✅ Obtient tous les cours - GET /courses
   * Sécurité: @IsOwner (accessible owner + admin)
   * Vue JSON: OwnerViewCourse
   */
  getAllCourses(): Observable<any[]> {
    console.log('🔄 CourseService.getAllCourses()');
    return this.http.get<any[]>(`${this.apiUrl}/courses`).pipe(
      tap(courses => {
        console.log('✅ CourseService.getAllCourses() - Courses loaded:', courses);
      }),
      catchError(error => {
        console.error('❌ CourseService.getAllCourses() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Obtient un cours par ID - GET /course/{id}
   * Vue JSON: OwnerViewCourse
   */
  getCourseById(id: number): Observable<any> {
    console.log('🔄 CourseService.getCourseById() - ID:', id);
    return this.http.get<any>(`${this.apiUrl}/course/${id}`).pipe(
      tap(course => {
        console.log('✅ CourseService.getCourseById() - Course loaded:', course);
      }),
      catchError(error => {
        console.error('❌ CourseService.getCourseById() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Obtient les cours à venir - GET /courses/upcoming
   * Sécurité: Public
   */
  getUpcomingCourses(): Observable<any[]> {
    console.log('🔄 CourseService.getUpcomingCourses()');
    return this.http.get<any[]>(`${this.apiUrl}/courses/upcoming`).pipe(
      tap(courses => {
        console.log('CourseService.getUpcomingCourses() - Upcoming courses:', courses);
      }),
      catchError(error => {
        console.error('❌ CourseService.getUpcomingCourses() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Obtient les cours d'un coach - GET /coach/{coachId}/courses/all
   * Vue JSON: CoachView
   */
  getCoursesByCoachId(coachId: number): Observable<any[]> {
    console.log('🔄 CourseService.getCoursesByCoachId() - Coach ID:', coachId);
    return this.http.get<any[]>(`${this.apiUrl}/coach/${coachId}/courses/all`).pipe(
      tap(courses => {
        console.log('✅ CourseService.getCoursesByCoachId() - Courses loaded:', courses);
      }),
      catchError(error => {
        console.error('❌ CourseService.getCoursesByCoachId() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Obtient les cours à venir d'un coach - GET /coach/{coachId}/upcoming-courses
   * Sécurité: @IsCoach
   * Vue JSON: CoachView
   */
  getUpcomingCoursesByCoachId(coachId: number): Observable<any[]> {
    console.log('🔄 CourseService.getUpcomingCoursesByCoachId() - Coach ID:', coachId);
    return this.http.get<any[]>(`${this.apiUrl}/coach/${coachId}/upcoming-courses`).pipe(
      tap(courses => {
        console.log('✅ CourseService.getUpcomingCoursesByCoachId() - Courses loaded:', courses);
      }),
      catchError(error => {
        console.error('❌ CourseService.getUpcomingCoursesByCoachId() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Obtient les cours d'un chien - GET /dog/{dogId}/courses
   * Sécurité: @IsOwner + vérification propriété du chien
   * Vue JSON: OwnerViewCourse
   */
  getCoursesByDogId(dogId: number): Observable<any[]> {
    console.log('🔄 CourseService.getCoursesByDogId() - Dog ID:', dogId);
    return this.http.get<any[]>(`${this.apiUrl}/dog/${dogId}/courses`).pipe(
      tap(courses => {
        console.log('✅ CourseService.getCoursesByDogId() - Courses loaded:', courses);
      }),
      catchError(error => {
        console.error('❌ CourseService.getCoursesByDogId() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Obtient les cours par tranche d'âge - GET /agerange/{ageRangeId}/courses
   * Vue JSON: OwnerViewCourse
   */
  getCoursesByAgeRange(ageRangeId: number): Observable<any[]> {
    console.log('🔄 CourseService.getCoursesByAgeRange() - Age Range ID:', ageRangeId);
    return this.http.get<any[]>(`${this.apiUrl}/agerange/${ageRangeId}/courses`).pipe(
      tap(courses => {
        console.log('✅ CourseService.getCoursesByAgeRange() - Courses loaded:', courses);
      }),
      catchError(error => {
        console.error('❌ CourseService.getCoursesByAgeRange() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Crée un nouveau cours - POST /course
   * Content-Type: application/json
   * Vue JSON: OwnerViewCourse
   * Validation: Course.CreateCourse.class
   *
   * Réponses:
   * - 201 Created: Cours créé avec succès
   * - 400 Bad Request: Données invalides
   * - 404 Not Found: Coach ou CourseType non trouvé
   */
  createCourse(courseData: any): Observable<any> {
    console.log('🔄 CourseService.createCourse() - Data:', courseData);

    // Format des données selon l'API backend
    const payload = {
      title: courseData.title,
      description: courseData.description,
      startDatetime: courseData.startDatetime, // ISO 8601 string
      endDatetime: courseData.endDatetime,     // ISO 8601 string
      maxCapacity: courseData.maxCapacity,
      coach: {
        id: courseData.coach.id
      },
      courseType: {
        id: courseData.courseType.id
      }
      // Le club est automatiquement défini (ID=1) côté backend
    };

    return this.http.post(`${this.apiUrl}/course`, payload).pipe(
      tap((newCourse: any) => {
        console.log('✅ CourseService.createCourse() - Course created:', newCourse);
      }),
      catchError(error => {
        console.error('❌ CourseService.createCourse() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Met à jour un cours - PUT /course/{id}
   * Content-Type: application/json
   *
   * Réponses:
   * - 200 OK: Cours modifié avec succès
   * - 404 Not Found: Cours, coach ou type de cours non trouvé
   */
  updateCourse(courseId: number, courseData: any): Observable<any> {
    console.log('🔄 CourseService.updateCourse() - ID:', courseId, 'Data:', courseData);

    // Format des données selon l'API backend
    const payload = {
      title: courseData.title,
      description: courseData.description,
      startDatetime: courseData.startDatetime, // ISO 8601 string
      endDatetime: courseData.endDatetime,     // ISO 8601 string
      maxCapacity: courseData.maxCapacity,
      coach: {
        id: courseData.coach.id
      },
      courseType: {
        id: courseData.courseType.id
      }
      // Le club reste toujours le club par défaut (ID=1) côté backend
    };

    return this.http.put(`${this.apiUrl}/course/${courseId}`, payload).pipe(
      tap((updatedCourse: any) => {
        console.log('✅ CourseService.updateCourse() - Course updated:', updatedCourse);
      }),
      catchError(error => {
        console.error('❌ CourseService.updateCourse() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Supprime un cours - DELETE /course/{id}
   *
   * Réponses:
   * - 204 No Content: { "message": "Course and all associated registrations deleted successfully" }
   * - 404 Not Found: { "error": "Course not found with id: 123" }
   * - 500 Internal Server Error: { "error": "Unexpected error occurred: ..." }
   *
   * ⚠️ Important: La suppression supprime automatiquement toutes les inscriptions liées
   */
  deleteCourse(courseId: number): Observable<any> {
    console.log('🔄 CourseService.deleteCourse() - ID:', courseId);
    return this.http.delete(`${this.apiUrl}/course/${courseId}`).pipe(
      tap(() => {
        console.log('✅ CourseService.deleteCourse() - Course deleted');
      }),
      catchError(error => {
        console.error('❌ CourseService.deleteCourse() - Error:', error);
        return throwError(() => error);
      })
    );
  }
}
