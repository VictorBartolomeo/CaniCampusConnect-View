import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {tap, catchError} from 'rxjs/operators';
import {Dog} from '../models/dog';
import {AuthStateService} from './auth-state.service';
import {UserService} from './user.service';
import {BreedService} from './breed.service';
import {Breed} from '../models/breed';
import {differenceInMonths, differenceInYears, format} from 'date-fns';
import {fr} from 'date-fns/locale';
import {GENDER_OPTIONS} from '../models/gender.options';

export interface CreateDogData {
  name: string;
  birthDate: string | null;
  gender: string;
  chipNumber?: string | null;
  owner: { id: number };
  breeds: { id: number }[];
}

export interface UpdateDogData {
  id: number;
  name: string;
  birthDate: string | null;
  gender: string;
  chipNumber?: string | null;
  breeds: { id: number }[];
}

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

  // ====== MÉTHODES UTILITAIRES POUR LES DATES ======

  /**
   * Formate une date pour l'envoi au backend (évite les problèmes de fuseau horaire)
   */
  formatDateForBackend(date: Date | null | undefined): string | null {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  /**
   * Formate une date pour l'affichage
   */
  formatDateForDisplay(dateString: string | Date | undefined): string {
    if (!dateString) return 'Non renseignée';

    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  }

  /**
   * Calcule l'âge d'un chien
   */
  getDogAge(birthDate: string | Date | undefined): string {
    if (birthDate === undefined || birthDate === null) {
      return 'Âge inconnu';
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      console.error('Invalid birth date provided to getDogAge:', birthDate);
      return 'Âge inconnu';
    }

    const now = new Date();
    const years = differenceInYears(now, birth);

    if (years < 1) {
      const months = differenceInMonths(now, birth);
      if (months <= 0) {
        return "Nouveau-né";
      }
      return `${months} mois`;
    } else {
      return `${years} an${years > 1 ? 's' : ''}`;
    }
  }

  // ====== MÉTHODES POUR LA GESTION DES GENRES ======

  /**
   * Récupère l'icône et la couleur du genre
   */
  getGenderIcon(gender: string | undefined): { icon: any, color: string } {
    if (!gender) {
      return {
        icon: 'pi pi-question',
        color: 'text-gray-400'
      };
    }

    const genderOption = GENDER_OPTIONS.find(option => option.value === gender);

    if (genderOption) {
      return {
        icon: genderOption.icon,
        color: genderOption.color
      };
    }

    return {
      icon: 'pi pi-question',
      color: 'text-gray-400'
    };
  }

  /**
   * Récupère le label du genre
   */
  getGenderLabel(gender: string | undefined): string {
    if (!gender) {
      return 'Non spécifié';
    }

    const genderOption = GENDER_OPTIONS.find(option => option.value === gender);
    return genderOption ? genderOption.label : 'Non spécifié';
  }

  // ====== MÉTHODES POUR LES RACES ======

  /**
   * Récupère les noms des races d'un chien
   */
  getBreedNames(breeds: Breed[] | undefined): string {
    if (!breeds || breeds.length === 0) {
      return 'Race inconnue';
    }

    return breeds.map(breed => breed.name).join(' × ');
  }

  // ====== MÉTHODES POUR LA SANTÉ ======

  /**
   * Récupère le dernier poids enregistré
   */
  getLatestWeight(dog: Dog): string {
    if (!dog?.dogWeights || dog.dogWeights.length === 0) {
      return 'Non enregistré';
    }

    const latestWeight = [...dog.dogWeights].sort((a, b) =>
      new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
    )[0];

    return `${latestWeight.weightValue} kg`;
  }

  /**
   * Récupère le statut de santé
   */
  getHealthStatus(dog: Dog): { label: string, color: string } {
    if (!dog) {
      return { label: 'Inconnu', color: 'text-gray-500' };
    }

    const hasMedication = dog.medicationTreatments && dog.medicationTreatments.some(treatment => {
      const now = new Date();
      return !treatment.endDate || new Date(treatment.endDate) > now;
    });

    if (hasMedication) {
      return { label: 'Traitement en cours', color: 'text-orange-500' };
    } else {
      return { label: 'En bonne santé', color: 'text-green-600' };
    }
  }

  /**
   * Récupère le statut des vaccinations
   */
  getVaccinationStatus(dog: Dog): { label: string, color: string } {
    if (!dog || !dog.vaccinations || dog.vaccinations.length === 0) {
      return { label: 'Non renseignée', color: 'text-gray-500' };
    }

    const now = new Date();
    const allUpToDate = dog.vaccinations.every(vaccine => {
      const expDate = vaccine.reminderDate || vaccine.vaccinationDate;
      return expDate && new Date(expDate) > now;
    });

    return allUpToDate
      ? { label: 'À jour', color: 'text-green-600' }
      : { label: 'À vérifier', color: 'text-red-500' };
  }

  // ====== MÉTHODES CRUD ======

  /**
   * Crée un nouveau chien
   */
  createDog(dogData: CreateDogData): Observable<Dog> {
    return this.http.post<Dog>(`${this.apiUrl}/dog`, dogData).pipe(
      tap(() => {
        this.loadUserDogs();
      }),
      catchError(error => {
        console.error('Erreur lors de la création du chien:', error);
        throw error;
      })
    );
  }

  /**
   * Met à jour un chien existant
   */
  updateDog(dogData: UpdateDogData): Observable<Dog> {
    return this.http.put<Dog>(`${this.apiUrl}/dog/${dogData.id}`, dogData).pipe(
      tap((updatedDog) => {
        this.loadUserDogs();
        this.setActiveDog(updatedDog);
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour du chien:', error);
        throw error;
      })
    );
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
