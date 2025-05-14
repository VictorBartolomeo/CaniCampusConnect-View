// dog.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Dog } from '../models/dog';

@Injectable({
  providedIn: 'root'
})
export class DogService {

  public userDogsSubject = new BehaviorSubject<Dog[]>([]);
  public userDogs$: Observable<Dog[]> = this.userDogsSubject.asObservable();

  private activeDogSubject = new BehaviorSubject<Dog | null>(null);
  public activeDog$: Observable<Dog | null> = this.activeDogSubject.asObservable();

  private apiUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Charger les chiens quand le service est initialisé
    this.loadUserDogs();
  }

  public loadUserDogs(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.warn('Impossible de charger les chiens : userId non disponible.');
      this.userDogsSubject.next([]);
      this.activeDogSubject.next(null);
      return;
    }

    this.http.get<Dog[]>(`${this.apiUrl}/owner/${userId}/dogs`).pipe(
      tap(dogs => {
        this.userDogsSubject.next(dogs || []);

        // Vérifier si un chien actif existe déjà en localStorage
        const savedActiveDogId = localStorage.getItem('activeDogId');

        if (dogs && dogs.length > 0) {
          const currentActiveDog = this.activeDogSubject.value;

          // Si un ID de chien actif est sauvegardé, on l'utilise
          if (savedActiveDogId) {
            const savedDog = dogs.find(d => d.id === +savedActiveDogId);
            if (savedDog) {
              this.setActiveDog(savedDog);
              return;
            }
          }

          // Sinon, on vérifie si le chien actuel existe encore dans la liste
          if (!currentActiveDog || !dogs.find(d => d.id === currentActiveDog.id)) {
            this.setActiveDog(dogs[0]); // Par défaut le premier chien
          }
        } else {
          this.setActiveDog(null);
        }
      }),
      catchError(err => {
        console.error('Erreur lors du chargement des chiens:', err);
        this.userDogsSubject.next([]);
        this.setActiveDog(null);
        return of([]); // Retourne un Observable vide en cas d'erreur
      })
    ).subscribe();
  }

  setActiveDog(dog: Dog | null): void {
    this.activeDogSubject.next(dog);
    // Sauvegarder l'ID du chien actif dans le localStorage pour persistance
    if (dog) {
      localStorage.setItem('activeDogId', dog.id.toString());
    } else {
      localStorage.removeItem('activeDogId');
    }
  }

  getActiveDog(): Dog | null {
    return this.activeDogSubject.value;
  }
}
