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
    this.loadUserDogs();
  }

  public loadUserDogs(): void {
    const userId = this.authService.getUserId();
    console.log('ID utilisateur récupéré:', userId);

    if (!userId) {
      console.warn('Impossible de charger les chiens : userId non disponible.');
      this.userDogsSubject.next([]);
      this.activeDogSubject.next(null);
      return;
    }

    this.http.get<Dog[]>(`${this.apiUrl}/owner/${userId}/dogs`).pipe(
      tap(dogs => {
        console.log('Chiens récupérés:', dogs);
        this.userDogsSubject.next(dogs || []);
        this.setActiveDog(dogs[0]);
      }))}


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
