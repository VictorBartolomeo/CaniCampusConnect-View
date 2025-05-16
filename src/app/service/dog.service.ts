// dog.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {tap, catchError} from 'rxjs/operators';
import {AuthService} from './auth.service';
import {Dog} from '../models/dog';

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

    this.http.get<Dog[]>(`${this.apiUrl}/owner/${userId}/dogs`).subscribe({
      next: (dogs) => {
        this.userDogsSubject.next(dogs);
        this.setActiveDog(dogs[0]);
      }
    })
  }


  setActiveDog(dog: Dog | null): void {
    this.activeDogSubject.next(dog);
    if (dog) {
      localStorage.setItem('activeDogId', dog.id.toString());
    } else {
      localStorage.removeItem('activeDogId');
    }
  }

  getActiveDog(): Dog | null {
    return this.activeDogSubject.value;
  }

  getDogDetails(dogId: number): Observable<Dog> {
    return this.http.get<Dog>(`${this.apiUrl}/dog/${dogId}`).pipe(
      tap(dog => {
        // Optionnel: mettre à jour le chien actif avec les données détaillées
        this.setActiveDog(dog);
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des détails du chien:', error);
        return of(null as any);
      })
    );
  }
}
