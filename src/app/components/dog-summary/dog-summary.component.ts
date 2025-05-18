import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Dog } from '../../models/dog';
import { differenceInMonths, differenceInYears, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { DogService } from '../../service/dog.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWeightScale, faMars, faVenus, faMarsStroke, faVenusDouble } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { Gender } from '../../models/gender.enum';

@Component({
  selector: 'app-dog-summary',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    FontAwesomeModule
  ],
  templateUrl: './dog-summary.component.html',
  styleUrl: './dog-summary.component.scss'
})
export class DogSummaryComponent implements OnInit {
  @Input() dog: Dog | null = null;
  @Output() editRequested = new EventEmitter<void>();

  // Icônes Font Awesome
  weightIcon = faWeightScale;
  maleIcon = faMars;
  femaleIcon = faVenus;
  sterilizedMaleIcon = faMarsStroke;
  sterilizedFemaleIcon = faVenusDouble;

  // Enum Gender pour être utilisé dans le template
  genderEnum = Gender;

  private subscription!: Subscription;

  constructor(
    private dogService: DogService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      this.dog = dog;
      console.log('Dog summary updated for dog:', dog?.name);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Retourne l'icône et la couleur en fonction du genre
  getGenderIcon(): { icon: any, color: string, mainColor: string } {
    if (!this.dog || !this.dog.gender) {
      return {
        icon: this.maleIcon,
        color: 'text-gray-400',
        mainColor: 'text-gray-500'
      };
    }

    switch (this.dog.gender) {
      case Gender.MALE:
        return {
          icon: this.maleIcon,
          color: 'text-blue-300',
          mainColor: 'text-blue-600'
        };
      case Gender.STERILIZED_MALE:
        return {
          icon: this.sterilizedMaleIcon,
          color: 'text-blue-300',
          mainColor: 'text-blue-600'
        };
      case Gender.FEMALE:
        return {
          icon: this.femaleIcon,
          color: 'text-pink-300',
          mainColor: 'text-pink-600'
        };
      case Gender.STERILIZED_FEMALE:
        return {
          icon: this.sterilizedFemaleIcon,
          color: 'text-pink-300',
          mainColor: 'text-pink-600'
        };
      default:
        return {
          icon: this.maleIcon,
          color: 'text-gray-400',
          mainColor: 'text-gray-500'
        };
    }
  }

  // Retourne le nom d'affichage du genre
  getGenderDisplayName(): string {
    if (!this.dog || !this.dog.gender) {
      return 'Non spécifié';
    }

    // Retourne directement la valeur de l'enum, qui contient déjà les libellés en français
    return this.dog.gender;
  }

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

  getBreedNames(): string {
    if (!this.dog?.breeds || this.dog.breeds.length === 0) {
      return 'Race inconnue';
    }

    return this.dog.breeds.map(breed => breed.name).join(' × ');
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return 'Non renseignée';

    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  }

  getLatestWeight(): string {
    if (!this.dog?.dogWeights || this.dog.dogWeights.length === 0) {
      return 'Non enregistré';
    }

    const latestWeight = [...this.dog.dogWeights].sort((a, b) =>
      new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
    )[0];

    return `${latestWeight.weightValue} kg (${format(new Date(latestWeight.measurementDate), 'dd/MM/yyyy')})`;
  }

  getHealthStatus(): { label: string, color: string } {
    if (!this.dog) {
      return { label: 'Inconnu', color: 'text-gray-500' };
    }

    const hasMedication = this.dog.medicationTreatments && this.dog.medicationTreatments.some(treatment => {
      const now = new Date();
      return !treatment.endDate || new Date(treatment.endDate) > now;
    });

    if (hasMedication) {
      return { label: 'Traitement en cours', color: 'text-orange-500' };
    } else {
      return { label: 'En bonne santé', color: 'text-green-600' };
    }
  }

  getVaccinationStatus(): { label: string, color: string } {
    if (!this.dog || !this.dog.vaccinations || this.dog.vaccinations.length === 0) {
      return { label: 'Non renseignée', color: 'text-gray-500' };
    }

    const now = new Date();
    const allUpToDate = this.dog.vaccinations.every(vaccine => {
      const expDate = vaccine.reminderDate || vaccine.vaccinationDate;
      return expDate && new Date(expDate) > now;
    });

    return allUpToDate
      ? { label: 'À jour', color: 'text-green-600' }
      : { label: 'À vérifier', color: 'text-red-500' };
  }

  showEditForm(): void {
    this.editRequested.emit();
  }

  navigateToAddDog(): void {
    this.router.navigate(['/dashboard/manage-dog'], { queryParams: { add: true } });
  }
}
