import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {TagModule} from 'primeng/tag';
import {BadgeModule} from 'primeng/badge';
import {TooltipModule} from 'primeng/tooltip';
import {Dog} from '../../../models/dog';
import {differenceInMonths, differenceInYears, format} from 'date-fns';
import {fr} from 'date-fns/locale';
import {Subscription} from 'rxjs';
import {DogService} from '../../../service/dog.service';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faWeightScale} from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';
import {Gender} from '../../../models/gender.enum';
import {GENDER_OPTIONS} from '../../../models/gender.options';

@Component({
  selector: 'app-dog-summary',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    FontAwesomeModule,
    TagModule,
    BadgeModule,
    TooltipModule
  ],
  templateUrl: './dog-summary.component.html',
  styleUrl: './dog-summary.component.scss'
})
export class DogSummaryComponent implements OnInit {
  @Input() dog: Dog | null = null;
  @Output() editRequested = new EventEmitter<void>();
  weightIcon = faWeightScale;
  genderEnum = Gender;
  genderOptions = GENDER_OPTIONS;
  private subscription!: Subscription;

  constructor(
    private dogService: DogService,
    private router: Router
  ) {}

  getDogAvatarUrl(): string {
    return this.dog ? this.dogService.getDogAvatarUrl(this.dog) : "?";
  }

  ngOnInit() {
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      this.dog = dog;
      console.log('Dog summary updated for dog:', dog?.name);
    });
    if (this.dog) {
      console.log('Dog data:', this.dog);
      console.log('Dog breeds:', this.dog.breeds);
      console.log('Avatar URL result:', this.getDogAvatarUrl());
    }
    }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getGenderIcon(): { icon: any, color: string } {
    // Trouve l'option correspondante dans GENDER_OPTIONS
    if (!this.dog || !this.dog.gender) {
      return {
        icon: 'pi pi-question',
        color: 'text-gray-400'
      };
    }

    // ✅ Créer une référence locale pour éviter les problèmes de nullabilité
    const dogGender = this.dog.gender;
    const genderOption = this.genderOptions.find(option => option.value === dogGender);

    if (genderOption) {
      return {
        icon: genderOption.icon,
        color: genderOption.color
      };
    }

    // Fallback
    return {
      icon: 'pi pi-question',
      color: 'text-gray-400'
    };
  }

  getGenderLabel(): string {
    if (!this.dog || !this.dog.gender) {
      return 'Non spécifié';
    }

    // ✅ Créer une référence locale pour éviter les problèmes de nullabilité
    const dogGender = this.dog.gender;
    const genderOption = this.genderOptions.find(option => option.value === dogGender);
    return genderOption ? genderOption.label : 'Non spécifié';
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

    return `${latestWeight.weightValue} kg`;
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

  navigateToAddDog(): void {
    this.router.navigate(['/dashboard/manage-dog'], { queryParams: { add: true } });
  }
}
