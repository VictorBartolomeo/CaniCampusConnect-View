
import { Injectable } from '@angular/core';
import {Observable, BehaviorSubject, tap, forkJoin, catchError, of, map, throwError} from 'rxjs';
import { CoachService, CoachResponse } from './coach.service';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080';

  // Gestion des coaches
  private coachesSubject = new BehaviorSubject<any[]>([]);
  public coaches$ = this.coachesSubject.asObservable();

  // Gestion des utilisateurs
  private usersSubject = new BehaviorSubject<any[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(
    private coachService: CoachService,
    private userService: UserService,
    private http: HttpClient
  ) {}

  // ===== MÉTHODES POUR LA GESTION DES COACHES =====

  loadCoaches(): Observable<any[] | CoachResponse> {
    return this.coachService.getAllCoaches().pipe(
      tap((response: any[] | CoachResponse) => {
        let coaches: any[] = [];

        if (Array.isArray(response)) {
          coaches = response;
        } else if (response && typeof response === 'object') {
          if (Array.isArray(response.data)) {
            coaches = response.data;
          } else if (Array.isArray(response.content)) {
            coaches = response.content;
          } else if (Array.isArray(response.coaches)) {
            coaches = response.coaches;
          } else {
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

  addCoach(coachData: any): Observable<any> {
    return this.coachService.registerCoach(coachData).pipe(
      tap(newCoach => {
        const currentCoaches = this.coachesSubject.getValue();
        this.coachesSubject.next([...currentCoaches, newCoach]);
      })
    );
  }

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

  deleteCoach(coachId: number): Observable<any> {
    return this.coachService.deleteCoach(coachId).pipe(
      tap(() => {
        const currentCoaches = this.coachesSubject.getValue();
        const updatedCoaches = currentCoaches.filter(coach => coach.id !== coachId);
        this.coachesSubject.next(updatedCoaches);
      })
    );
  }

  getCoaches(): any[] {
    return this.coachesSubject.getValue();
  }

  // ===== MÉTHODES POUR LA GESTION DES UTILISATEURS =====

  /**
   * Retourne tous les users ainsi que leurs rôles liés à l'héritage backend
   */
  loadUsers(): Observable<any[]> {
    console.log('🔄 AdminService.loadUsers() - Chargement avec le nouvel endpoint...');

    return this.http.get<any[]>(`${this.apiUrl}/users/with-roles`).pipe(
      tap(users => {
        console.log('✅ AdminService - Utilisateurs chargés depuis /users/with-roles:', {
          total: users.length,
          users: users
        });

        console.log('📊 Répartition des rôles:', this.getRoleDistribution(users));

        this.usersSubject.next(users);
      }),
      catchError(error => {
        console.error('❌ AdminService.loadUsers() - Erreur:', error);

        // En cas d'erreur, essayer l'ancien endpoint comme fallback
        return this.loadUsersWithFallback();
      })
    );
  }


  /**
   * ✅ AJOUTÉ : Méthode de fallback pour charger les utilisateurs séparément
   */
  private loadUsersWithFallback(): Observable<any[]> {
    console.log('🔄 Utilisation du fallback - chargement séparé des utilisateurs...');

    return forkJoin({
      owners: this.http.get<any[]>(`${this.apiUrl}/users/owners`).pipe(catchError(() => of([]))),
      coaches: this.http.get<any[]>(`${this.apiUrl}/users/coaches`).pipe(catchError(() => of([])))
    }).pipe(
      map(({ owners, coaches }) => {
        const allUsers = [
          ...owners.map(owner => ({ ...owner, role: 'ROLE_OWNER' })),
          ...coaches.map(coach => ({ ...coach, role: 'ROLE_COACH' }))
        ];

        console.log('✅ AdminService - Fallback réussi:', {
          owners: owners.length,
          coaches: coaches.length,
          total: allUsers.length
        });

        this.usersSubject.next(allUsers);
        return allUsers;
      })
    );
  }

  /**
   * ✅ AJOUTÉ : Inférer le rôle d'un utilisateur si pas présent
   */
  private inferRoleFromUser(user: any): string {
    // Si l'utilisateur a une propriété qui indique son type
    if (user.userType) {
      switch (user.userType) {
        case 'OWNER': return 'ROLE_OWNER';
        case 'COACH': return 'ROLE_COACH';
        case 'CLUB_OWNER': return 'ROLE_CLUB_OWNER';
      }
    }

    // Logique d'inférence basée sur les propriétés
    if (user.specialization || user.experience) {
      return 'ROLE_COACH';
    }

    // Par défaut, considérer comme owner
    return 'ROLE_OWNER';
  }

  /**
   * ✅ AJOUTÉ : Calculer la répartition des rôles pour le debug
   */
  private getRoleDistribution(users: any[]): any {
    return users.reduce((dist, user) => {
      const role = user.role || 'NO_ROLE';
      dist[role] = (dist[role] || 0) + 1;
      return dist;
    }, {});
  }

  /**
   * ✅ CORRIGÉ : Recherche d'utilisateurs
   */
  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/search?query=${encodeURIComponent(query)}`);
  }

  /**
   * ✅ CORRIGÉ : Obtenir les statistiques des utilisateurs
   */
  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/stats`);
  }

  /**
   * Mettre à jour un utilisateur
   */
  updateUser(userData: any): Observable<any> {
    console.log('🔄 AdminService.updateUser() - Données à envoyer:', userData);

    if (!userData.id) {
      console.error('❌ AdminService.updateUser() - ID utilisateur manquant');
      return throwError(() => new Error('ID utilisateur manquant'));
    }

    const endpoint = `user/${userData.id}`;

    // Préparer les données pour le backend (selon l'exemple que vous avez fourni)
    const updatePayload = {
      email: userData.email,
      firstname: userData.firstname,
      lastname: userData.lastname,
      phone: userData.phone || null,
      avatarUrl: userData.avatarUrl || null,
      emailValidated: userData.emailValidated || userData.validated || true
    };

    console.log('📤 AdminService.updateUser() - Payload:', updatePayload);
    console.log('🌐 AdminService.updateUser() - Endpoint:', `${this.apiUrl}/${endpoint}`);

    return this.http.put(`${this.apiUrl}/${endpoint}`, updatePayload).pipe(
      tap(() => {
        console.log('✅ AdminService.updateUser() - Mise à jour réussie');

        // Mettre à jour la liste locale des utilisateurs
        const currentUsers = this.usersSubject.getValue();
        const index = currentUsers.findIndex(u => u.id === userData.id);
        if (index !== -1) {
          const updatedUsers = [...currentUsers];
          updatedUsers[index] = { ...updatedUsers[index], ...userData };
          this.usersSubject.next(updatedUsers);
          console.log('✅ AdminService.updateUser() - Liste locale mise à jour');
        }
      }),
      map(() => {
        // Retourner l'utilisateur mis à jour puisque l'endpoint retourne 204 No Content
        return { ...userData };
      }),
      catchError(error => {
        console.error('❌ AdminService.updateUser() - Erreur:', error);
        console.error('📊 Détails erreur:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          body: error.error
        });
        return throwError(() => error);
      })
    );
  }


  /**
   * ✅ CORRIGÉ : Supprimer/anonymiser un utilisateur
   */
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/${userId}`).pipe(
      tap(() => {
        const currentUsers = this.usersSubject.getValue();
        const updatedUsers = currentUsers.filter(user => user.id !== userId);
        this.usersSubject.next(updatedUsers);
      })
    );
  }

  /**
   * ✅ CORRIGÉ : Ajouter un nouvel utilisateur
   */
  addUser(userData: any): Observable<any> {
    let endpoint = '';

    switch (userData.role) {
      case 'ROLE_OWNER':
        endpoint = 'owner/register';
        break;
      case 'ROLE_COACH':
        endpoint = 'coach/register';
        break;
      case 'ROLE_CLUB_OWNER':
        // Vous devrez peut-être créer cet endpoint ou utiliser un autre
        endpoint = 'admin/register';
        break;
      default:
        endpoint = 'owner/register'; // Fallback vers owner
    }

    return this.http.post<any>(`${this.apiUrl}/${endpoint}`, userData).pipe(
      tap(newUser => {
        const currentUsers = this.usersSubject.getValue();
        const newUserWithRole = { ...newUser, role: userData.role };
        this.usersSubject.next([...currentUsers, newUserWithRole]);
      })
    );
  }

  /**
   * ✅ AJOUTÉ : Obtenir un utilisateur par ID
   */
  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Obtenir la valeur actuelle des utilisateurs
   */
  getUsers(): any[] {
    return this.usersSubject.getValue();
  }
}
