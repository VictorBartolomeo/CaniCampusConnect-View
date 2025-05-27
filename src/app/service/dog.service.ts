import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {tap, catchError} from 'rxjs/operators';
import {Dog} from '../models/dog';
import {AuthStateService} from './auth-state.service';
import {UserService} from './user.service';

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
    private authStateService: AuthStateService,
    private userService: UserService
  ) {
    // S'abonner aux changements d'ID utilisateur pour charger les chiens
    this.authStateService.userId$.subscribe(userId => {
      if (userId) {
        this.loadUserDogs(userId);
      }
    });
  }

  public loadUserDogs(userId?: number | null): void {
    // Utiliser l'ID fourni ou l'obtenir depuis le service d'état
    const id = userId || this.authStateService.getUserId();
    if (!id) return;

    console.log('ID utilisateur récupéré:', id);

    this.http.get<Dog[]>(`${this.apiUrl}/owner/${id}/dogs`).subscribe({
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
