import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Owner, Coach, ClubOwner, User } from '../models/user';
import { AuthStateService } from './auth-state.service';

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
    private authStateService: AuthStateService
  ) {
    console.log('🏗️ UserService constructeur initialisé');

    // S'abonner aux changements d'ID utilisateur pour charger les informations utilisateur
    this.authStateService.userId$.subscribe(userId => {
      console.log('🔑 UserService - userId changed:', userId);
      if (userId) {
        const role = this.authStateService.getRole();
        console.log('👥 UserService - role:', role);

        if (role === 'ROLE_OWNER') {
          console.log('📞 UserService - Chargement des infos owner pour userId:', userId);
          this.loadOwnerInfo(userId).subscribe({
            next: (owner) => console.log('✅ UserService - Owner chargé avec succès:', owner),
            error: (error) => console.error('❌ UserService - Erreur chargement owner:', error)
          });
        } else if (role === 'ROLE_COACH') {
          this.loadCoachInfo(userId).subscribe();
        } else if (role === 'ROLE_CLUB_OWNER') {
          this.loadClubOwnerInfo(userId).subscribe();
        }
      } else {
        console.log('🚫 UserService - Aucun userId, clear des données');
        this.clearUserData();
      }
    });

    // Debug de l'observable owner$
    this.owner$.subscribe(owner => {
      console.log('🔄 UserService - owner$ émis:', owner);
    });
  }

  // ✅ MÉTHODE getFullName() - La méthode principale que vous voulez utiliser
  getFullName(user?: User | null): string {
    console.log('🏷️ getFullName appelé avec user:', user);

    if (!user) {
      const role = this.authStateService.getRole();
      console.log('🔍 Pas d\'user fourni, récupération selon le rôle:', role);

      switch (role) {
        case 'ROLE_OWNER':
        case 'OWNER':
          user = this.getCurrentOwner();
          console.log('👤 Owner récupéré:', user);
          break;
        case 'ROLE_COACH':
        case 'COACH':
          user = this.getCurrentCoach();
          break;
        case 'ROLE_CLUB_OWNER':
        case 'CLUB_OWNER':
          user = this.getCurrentClubOwner();
          break;
      }
    }

    if (!user) {
      console.log('🚫 Aucun user trouvé, retour "Utilisateur"');
      return 'Utilisateur';
    }

    const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();
    console.log('🏷️ Nom complet généré:', fullName, 'depuis:', {
      firstname: user.firstname,
      lastname: user.lastname
    });

    return fullName || 'Utilisateur';
  }

  // Méthodes génériques pour tous les utilisateurs
  getCurrentUser<T extends User>(): Observable<T> {
    const userId = this.authStateService.getUserId();
    const role = this.authStateService.getRole();

    console.log('🔍 getCurrentUser - userId:', userId, 'role:', role);

    if (!userId || !role) {
      return of(null as unknown as T);
    }

    let endpoint = '';
    switch (role) {
      case 'ROLE_OWNER':
      case 'OWNER':
        endpoint = `owner/${userId}`;
        break;
      case 'ROLE_COACH':
      case 'COACH':
        endpoint = `coach/${userId}`;
        break;
      case 'ROLE_CLUB_OWNER':
      case 'CLUB_OWNER':
        endpoint = `clubowner/${userId}`;
        break;
      default:
        return of(null as unknown as T);
    }

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`).pipe(
      tap(user => {
        console.log('📥 getCurrentUser - user reçu:', user);
        this.updateUserSubject(user, role);
      }),
      catchError(error => {
        console.error(`❌ getCurrentUser - Erreur lors du chargement des informations de l'utilisateur:`, error);
        return of(null as unknown as T);
      })
    );
  }

  // ✅ CORRECTION : Gérer les rôles avec préfixe ROLE_
  private updateUserSubject(user: any, role: string): void {
    console.log('🔄 updateUserSubject appelé avec:', { user, role });

    switch (role) {
      case 'ROLE_OWNER':
      case 'OWNER':
        this.ownerSubject.next(user as Owner);
        console.log('✅ ownerSubject mis à jour avec ROLE_OWNER');
        break;
      case 'ROLE_COACH':
      case 'COACH':
        this.coachSubject.next(user as Coach);
        break;
      case 'ROLE_CLUB_OWNER':
      case 'CLUB_OWNER':
        this.clubOwnerSubject.next(user as ClubOwner);
        break;
    }
  }

  updateUser<T extends User>(userData: Partial<T>): Observable<T> {
    const userId = this.authStateService.getUserId();
    const role = this.authStateService.getRole();

    if (!userId || !role) {
      return of(null as unknown as T);
    }

    // ✅ CORRECTION : Gérer les rôles avec préfixe ROLE_
    let endpoint = '';
    switch (role) {
      case 'ROLE_OWNER':
      case 'OWNER':
        endpoint = `owner/${userId}`;
        break;
      case 'ROLE_COACH':
      case 'COACH':
        endpoint = `coach/${userId}`;
        break;
      case 'ROLE_CLUB_OWNER':
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
    const userId = this.authStateService.getUserId();
    const role = this.authStateService.getRole();

    if (!userId || !role) {
      return of(null);
    }

    // ✅ CORRECTION : Gérer les rôles avec préfixe ROLE_
    let endpoint = '';
    switch (role) {
      case 'ROLE_OWNER':
      case 'OWNER':
        endpoint = `owner/${userId}/password`;
        break;
      case 'ROLE_COACH':
      case 'COACH':
        endpoint = `coach/${userId}/password`;
        break;
      case 'ROLE_CLUB_OWNER':
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
    console.log('📡 loadOwnerInfo appelé avec ownerId:', ownerId);

    if (!ownerId) {
      console.log('🚫 ownerId null, réinitialisation ownerSubject');
      this.ownerSubject.next(null);
      return of(null);
    }

    const url = `${this.apiUrl}/owner/${ownerId}`;
    console.log('🌐 Requête HTTP vers:', url);

    return this.http.get<Owner>(url).pipe(
      tap(owner => {
        console.log('📥 Réponse HTTP reçue:', owner);
        console.log('📋 Détails owner:', {
          firstname: owner?.firstname,
          lastname: owner?.lastname,
          email: owner?.email,
          phone: owner?.phone,
          registrationDate: owner?.registrationDate
        });

        this.ownerSubject.next(owner);
        console.log('✅ ownerSubject.next() appelé avec:', owner);

        // Vérification immédiate
        const currentValue = this.ownerSubject.getValue();
        console.log('🔍 Valeur actuelle dans ownerSubject:', currentValue);
      }),
      catchError(error => {
        console.error('❌ Erreur HTTP lors du chargement des informations du propriétaire:', error);
        console.error('📊 Détails erreur:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        this.ownerSubject.next(null);
        return of(null);
      })
    );
  }

  getCurrentOwner(): Owner | null {
    const owner = this.ownerSubject.getValue();
    console.log('🔍 getCurrentOwner() retourne:', owner);
    return owner;
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

  // Méthode pour réinitialiser toutes les données utilisateur (à la déconnexion)
  clearUserData(): void {
    console.log('🧹 clearUserData appelé');
    this.ownerSubject.next(null);
    this.coachSubject.next(null);
    this.clubOwnerSubject.next(null);
    this.ownersListSubject.next([]);
  }
}
