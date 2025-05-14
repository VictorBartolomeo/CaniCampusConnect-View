import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Adaptez le chemin

// Assurez-vous que votre type Dog est correctement défini et importé
// import { Dog } from '../models/dog'; // Exemple de chemin
export interface Dog { // Utilisez votre propre définition de Dog
  id: number;
  name: string;
  // ... autres propriétés
}

@Injectable({
  providedIn: 'root'
})
export class DogService {

  private userDogsSubject = new BehaviorSubject<Dog[]>([]);
  public userDogs$: Observable<Dog[]> = this.userDogsSubject.asObservable();

  private activeDogSubject = new BehaviorSubject<Dog | null>(null);
  public activeDog$: Observable<Dog | null> = this.activeDogSubject.asObservable();

  private apiUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
  }

  public loadUserDogs(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.http.get<Dog[]>(`${this.apiUrl}/owner/${userId}/dogs`).pipe(
        tap(dogs => {
          this.userDogsSubject.next(dogs || []); // Assurer que c'est toujours un tableau
          if (dogs && dogs.length > 0) {
            const currentActiveDog = this.activeDogSubject.value;
            if (!currentActiveDog || !dogs.find(d => d.id === currentActiveDog.id)) {
              this.setActiveDog(dogs[0]);
            }
          } else {
            this.setActiveDog(null);
          }
        })
      ).subscribe({
        error: err => {
          console.error('Erreur lors du chargement des chiens:', err);
          this.userDogsSubject.next([]);
          this.setActiveDog(null);
        }
      });
    } else {
      console.warn('Impossible de charger les chiens : userId non disponible.');
      this.userDogsSubject.next([]);
      this.activeDogSubject.next(null);
    }
  }

  setActiveDog(dog: Dog | null): void {
    this.activeDogSubject.next(dog);
  }

  getActiveDog(): Dog | null {
    return this.activeDogSubject.value;
  }
}
