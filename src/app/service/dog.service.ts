import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {tap, catchError} from 'rxjs/operators';
import {Dog} from '../models/dog';
import {AuthStateService} from './auth-state.service';
import {UserService} from './user.service';
import {BreedService} from './breed.service';

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
    private userService: UserService,
    private breedService: BreedService
  ) {
    this.authStateService.userId$.subscribe(userId => {
      if (userId) {
        this.loadUserDogs(userId);
      }
    });
  }

  getDogAvatarUrl(dog: Dog): string {

    if (dog?.avatarUrl) {
      return `${this.apiUrl}${dog.avatarUrl}`;
    }

    if (dog?.breeds && dog.breeds.length > 0) {
      const primaryBreed = dog.breeds[0];

      const breedImageUrl = this.breedService.getBreedImageFromBreed(primaryBreed);

      if (breedImageUrl && breedImageUrl.trim() !== '') {
        if (breedImageUrl.startsWith('http')) {
          return breedImageUrl;
        } else {
          return `${this.apiUrl}${breedImageUrl}`;
        }
      }
    }

    // Priorité 3: Image par défaut
    console.log('🚫 Using fallback image');
    return '/icons/placeholder_no_breed.jpg';
  }



  public loadUserDogs(userId?: number | null): void {
    const id = userId || this.authStateService.getUserId();
    if (!id) return;

    this.http.get<Dog[]>(`${this.apiUrl}/owner/${id}/dogs`).subscribe({
      next: (dogs) => this.handleDogsLoaded(dogs),
      error: (error) => console.error('Erreur lors du chargement des chiens:', error)
    });
  }

  private handleDogsLoaded(dogs: Dog[]): void {
    if (!dogs || dogs.length === 0) {
      console.log('Aucun chien trouvé pour cet utilisateur');
      return;
    }

    this.userDogsSubject.next(dogs);

    const activeDog = this.findActiveDog(dogs);
    this.setActiveDog(activeDog);
  }

  private findActiveDog(dogs: Dog[]): Dog {
    const storedDogId = localStorage.getItem('activeDogId');

    if (storedDogId) {
      const storedDog = dogs.find(dog => dog.id.toString() === storedDogId);

      if (storedDog) {
        console.log('Chien trouvé dans le localStorage:', storedDog.name);
        return storedDog;
      }

      console.log('Chien du localStorage non trouvé, utilisation du premier chien');
    } else {
      console.log('Aucun chien dans le localStorage, utilisation du premier chien');
    }

    return dogs[0];
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
