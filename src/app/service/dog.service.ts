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

  public activeDogSubject = new BehaviorSubject<Dog | null>(null);
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
        if (dogs && dogs.length > 0) {
          this.userDogsSubject.next(dogs);

          // Récupérer l'ID du chien stocké dans le localStorage
          const storedDogId = localStorage.getItem('activeDogId');

          if (storedDogId) {
            // Essayer de trouver le chien correspondant dans la liste des chiens
            const storedDog = dogs.find(dog => dog.id.toString() === storedDogId);

            if (storedDog) {
              // Si le chien est trouvé, le définir comme chien actif
              console.log('Chien trouvé dans le localStorage:', storedDog.name);
              this.setActiveDog(storedDog);
            } else {
              // Si le chien n'est pas trouvé, utiliser le premier chien de la liste
              console.log('Chien du localStorage non trouvé, utilisation du premier chien');
              this.setActiveDog(dogs[0]);
            }
          } else {
            // Si aucun ID n'est stocké, utiliser le premier chien
            console.log('Aucun chien dans le localStorage, utilisation du premier chien');
            this.setActiveDog(dogs[0]);
          }
        } else {
          console.log('Aucun chien trouvé pour cet utilisateur');
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des chiens:', error);
      }
    });
  }

  setActiveDog(dog: Dog | null): void {
    this.activeDogSubject.next(dog);
    if (dog) {
      localStorage.setItem('activeDogId', dog.id.toString());
      console.log(`Chien actif défini: ${dog.name} (ID: ${dog.id})`);
    } else {
      localStorage.removeItem('activeDogId');
      console.log('Chien actif supprimé');
    }
  }

  getActiveDog(): Dog | null {
    return this.activeDogSubject.value;
  }

  loadDogAsActive(dogId: number): void {
    if (!dogId) return;

    this.getDogDetails(dogId).subscribe({
      next: (dog) => {
        if (dog) {
          console.log(`Chien chargé et défini comme actif: ${dog.name}`);
        }
      },
      error: (error) => {
        console.error(`Erreur lors du chargement du chien ${dogId}:`, error);
      }
    });
  }

  getDogDetails(dogId: number): Observable<Dog> {
    return this.http.get<Dog>(`${this.apiUrl}/dog/${dogId}`).pipe(
      tap(dog => {
        this.setActiveDog(dog);
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des détails du chien:', error);
        return of(null as any);
      })
    );
  }
}
