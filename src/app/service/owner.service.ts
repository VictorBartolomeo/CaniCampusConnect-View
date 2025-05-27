import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Owner } from '../models/owner';

@Injectable({
  providedIn: 'root'
})

export class OwnerService {
  private apiUrl = 'http://localhost:8080';

  public ownerSubject = new BehaviorSubject<Owner | null>(null);
  public owner$ = this.ownerSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Méthode pour charger les informations du propriétaire par son ID
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

  // Méthode pour mettre à jour les informations du propriétaire
  updateOwnerInfo(ownerData: Partial<Owner>): Observable<Owner> {
    const currentOwner = this.ownerSubject.getValue();

    if (!currentOwner || !currentOwner.id) {
      return of(currentOwner as Owner);
    }

    return this.http.put<Owner>(`${this.apiUrl}/owner/${currentOwner.id}`, ownerData).pipe(
      tap(updatedOwner => {
        // Mettre à jour le BehaviorSubject avec les nouvelles données
        this.ownerSubject.next(updatedOwner);
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour des informations du propriétaire:', error);
        return of(currentOwner as Owner);
      })
    );
  }

  // Méthode pour obtenir la valeur actuelle du propriétaire sans s'abonner
  getCurrentOwner(): Owner | null {
    return this.ownerSubject.getValue();
  }

  // Méthode utilitaire pour obtenir le nom complet
  getFullName(): string {
    const owner = this.getCurrentOwner();
    if (!owner) return 'Utilisateur';

    return `${owner.firstname || ''} ${owner.lastname || ''}`.trim() || 'Utilisateur';
  }

  // Méthode pour réinitialiser les données du propriétaire (à la déconnexion)
  clearOwnerData(): void {
    this.ownerSubject.next(null);
  }
}
