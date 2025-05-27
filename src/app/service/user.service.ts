import {forwardRef, Inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Owner, Coach, ClubOwner, User } from '../models/user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080';

  // Observables pour chaque type d'utilisateur
  private ownerSubject = new BehaviorSubject<Owner | null>(null);
  public owner$ = this.ownerSubject.asObservable();

  private coachSubject = new BehaviorSubject<Coach | null>(null);
  public coach$ = this.coachSubject.asObservable();

  private clubOwnerSubject = new BehaviorSubject<ClubOwner | null>(null);
  public clubOwner$ = this.clubOwnerSubject.asObservable();

  // Pour l'administration - liste des propriétaires (pour ClubOwner)
  private ownersListSubject = new BehaviorSubject<Owner[]>([]);
  public ownersList$ = this.ownersListSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(forwardRef(()=>AuthService))private authService: AuthService
  ) {}

  // Méthodes génériques pour tous les utilisateurs
  getCurrentUser<T extends User>(): Observable<T> {
    const userId = this.authService.getUserId();
    const role = this.authService.role;

    if (!userId || !role) {
      return of(null as unknown as T);
    }

    // Déterminer l'endpoint en fonction du rôle
    let endpoint = '';
    switch (role) {
      case 'OWNER':
        endpoint = `owner/${userId}`;
        break;
      case 'COACH':
        endpoint = `coach/${userId}`;
        break;
      case 'CLUB_OWNER':
        endpoint = `clubowner/${userId}`;
        break;
      default:
        return of(null as unknown as T);
    }

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`).pipe(
      tap(user => {
        this.updateUserSubject(user, role);
      }),
      catchError(error => {
        console.error(`Erreur lors du chargement des informations de l'utilisateur:`, error);
        return of(null as unknown as T);
      })
    );
  }

  private updateUserSubject(user: any, role: string): void {
    switch (role) {
      case 'OWNER':
        this.ownerSubject.next(user as Owner);
        break;
      case 'COACH':
        this.coachSubject.next(user as Coach);
        break;
      case 'CLUB_OWNER':
        this.clubOwnerSubject.next(user as ClubOwner);
        break;
    }
  }

  updateUser<T extends User>(userData: Partial<T>): Observable<T> {
    const userId = this.authService.getUserId();
    const role = this.authService.role;

    if (!userId || !role) {
      return of(null as unknown as T);
    }

    // Déterminer l'endpoint en fonction du rôle
    let endpoint = '';
    switch (role) {
      case 'OWNER':
        endpoint = `owner/${userId}`;
        break;
      case 'COACH':
        endpoint = `coach/${userId}`;
        break;
      case 'CLUB_OWNER':
        endpoint = `clubowner/${userId}`;
        break;
      default:
        return of(null as unknown as T);
    }

    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, userData).pipe(
      tap(updatedUser => {
        this.updateUserSubject(updatedUser, role);
      }),
      catchError(error => {
        console.error(`Erreur lors de la mise à jour des informations de l'utilisateur:`, error);
        return of(null as unknown as T);
      })
    );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    const userId = this.authService.getUserId();
    const role = this.authService.role;

    if (!userId || !role) {
      return of(null);
    }

    let endpoint = '';
    switch (role) {
      case 'OWNER':
        endpoint = `owner/${userId}/password`;
        break;
      case 'COACH':
        endpoint = `coach/${userId}/password`;
        break;
      case 'CLUB_OWNER':
        endpoint = `clubowner/${userId}/password`;
        break;
      default:
        return of(null);
    }

    return this.http.put(`${this.apiUrl}/${endpoint}`, {
      currentPassword,
      newPassword
    });
  }

  // Méthodes spécifiques pour Owner
  loadOwnerInfo(ownerId: number | null): Observable<Owner | null> {
    if (!ownerId) {
      this.ownerSubject.next(null);
      return of(null);
    }

    return this.http.get<Owner>(`${this.apiUrl}/owner/${ownerId}`).pipe(
      tap(owner => {
        this.ownerSubject.next(owner);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des informations du propriétaire:', error);
        this.ownerSubject.next(null);
        return of(null);
      })
    );
  }

  getCurrentOwner(): Owner | null {
    return this.ownerSubject.getValue();
  }

  // Méthodes spécifiques pour Coach
  loadCoachInfo(coachId: number): Observable<Coach | null> {
    return this.http.get<Coach>(`${this.apiUrl}/coach/${coachId}`).pipe(
      tap(coach => {
        this.coachSubject.next(coach);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des informations du coach:', error);
        this.coachSubject.next(null);
        return of(null);
      })
    );
  }

  getCurrentCoach(): Coach | null {
    return this.coachSubject.getValue();
  }

  // Méthodes spécifiques pour ClubOwner
  loadClubOwnerInfo(clubOwnerId: number): Observable<ClubOwner | null> {
    return this.http.get<ClubOwner>(`${this.apiUrl}/clubowner/${clubOwnerId}`).pipe(
      tap(clubOwner => {
        this.clubOwnerSubject.next(clubOwner);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des informations du propriétaire de club:', error);
        this.clubOwnerSubject.next(null);
        return of(null);
      })
    );
  }

  getCurrentClubOwner(): ClubOwner | null {
    return this.clubOwnerSubject.getValue();
  }

  // Méthodes d'administration pour ClubOwner
  // Récupération en temps réel de tous les propriétaires (pour l'administration)
  loadAllOwners(): Observable<Owner[]> {
    return this.http.get<Owner[]>(`${this.apiUrl}/owners`).pipe(
      tap(owners => {
        this.ownersListSubject.next(owners);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement de la liste des propriétaires:', error);
        return of([]);
      })
    );
  }

  // Utilitaires
  getFullName(user?: User | null): string {
    if (!user) {
      // Essayer de récupérer l'utilisateur selon le rôle
      const role = this.authService.role;
      switch (role) {
        case 'OWNER':
          user = this.getCurrentOwner();
          break;
        case 'COACH':
          user = this.getCurrentCoach();
          break;
        case 'CLUB_OWNER':
          user = this.getCurrentClubOwner();
          break;
      }
    }

    if (!user) return 'Utilisateur';
    return `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Utilisateur';
  }

  // Méthode pour réinitialiser toutes les données utilisateur (à la déconnexion)
  clearUserData(): void {
    this.ownerSubject.next(null);
    this.coachSubject.next(null);
    this.clubOwnerSubject.next(null);
    this.ownersListSubject.next([]);
  }
}
