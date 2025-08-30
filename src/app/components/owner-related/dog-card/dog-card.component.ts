import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardModule} from 'primeng/card';
import {TagModule} from 'primeng/tag';
import {ButtonModule} from 'primeng/button';
import {AvatarModule} from 'primeng/avatar';
import {TooltipModule} from 'primeng/tooltip';
import {BadgeModule} from 'primeng/badge';
import {RouterModule} from '@angular/router';
import {Dog} from '../../../models/dog';
import {DogService} from '../../../service/dog.service';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faWeightScale} from '@fortawesome/free-solid-svg-icons';
import {Gender} from '../../../models/gender.enum';
import {GENDER_OPTIONS} from '../../../models/gender.options';

@Component({
  selector: 'app-dog-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    BadgeModule,
    RouterModule,
    FontAwesomeModule
  ],
  templateUrl: './dog-card.component.html',
  styleUrl: './dog-card.component.scss'
})
export class DogCardComponent implements OnInit {
  @Input() dog!: Dog;

  // Icônes
  weightIcon = faWeightScale;

  // Enum Gender pour être utilisé dans le template
  genderEnum = Gender;

  // Options de genre pour faciliter l'accès
  genderOptions = GENDER_OPTIONS;

  latestWeight: any | undefined;
  hasMedication: boolean = false;
  areVaccinesUpToDate: boolean = false;
  favoriteCoach: string | null = null;
  mostCommonCourseType: string | null = null;

  constructor(public dogService: DogService) {}

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/img/avatars/golden.png';
  }

  getDogAvatarUrl(): string {
    return this.dogService.getDogAvatarUrl(this.dog);
  }

  ngOnInit() {
    if (this.dog) {
      this.processWeights();
      this.checkMedication();
      this.checkVaccines();
      this.determineFavoriteCoach();
      this.determineMostCommonCourseType();
    }
  }

  getGenderIcon(): { icon: any, color: string } {
    return this.dogService.getGenderIcon(this.dog.gender);
  }

  getGenderLabel(): string {
    return this.dogService.getGenderLabel(this.dog.gender);
  }

  getDogAge(): string {
    const age = this.dogService.getDogAge(this.dog.birthDate);
    return age === 'Âge inconnu' ? 'Âge inconnu' : age;
  }

  getBreedNames(): string {
    return this.dogService.getBreedNames(this.dog.breeds);
  }

  private processWeights() {
    if (this.dog.dogWeights && this.dog.dogWeights.length > 0) {
      // Utilisons des noms génériques pour éviter des erreurs de typage
      this.latestWeight = [...this.dog.dogWeights].sort((a, b) =>
        new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
      )[0];
    }
  }

  private checkMedication() {
    if (this.dog.medicationTreatments && this.dog.medicationTreatments.length > 0) {
      const now = new Date();
      this.hasMedication = this.dog.medicationTreatments.some(treatment =>
        !treatment.endDate || new Date(treatment.endDate) > now
      );
    }
  }

  private checkVaccines() {
    if (this.dog.vaccinations && this.dog.vaccinations.length > 0) {
      const now = new Date();
      // Utilisons des vérifications sécurisées pour éviter des erreurs de typage
      this.areVaccinesUpToDate = this.dog.vaccinations.every(vaccine => {
        const expDate = vaccine.reminderDate || vaccine.vaccinationDate; // Utilisons les propriétés qui existent réellement
        return expDate && new Date(expDate) > now;
      });
    }
  }

  private determineFavoriteCoach() {
    if (!this.dog.registrations || this.dog.registrations.length === 0) return;

    const coachCount: Record<string, number> = {};
    this.dog.registrations.forEach(reg => {
      if (reg.course?.coach) {
        // Utilisons une approche plus sécurisée
        const coachName = reg.course.coach.firstname + ' ' + reg.course.coach.lastname || 'Coach';
        coachCount[coachName] = (coachCount[coachName] || 0) + 1;
      }
    });

    let maxCount = 0;
    Object.entries(coachCount).forEach(([coach, count]) => {
      if (count > maxCount) {
        maxCount = count;
        this.favoriteCoach = coach;
      }
    });
  }

  private determineMostCommonCourseType() {
    if (!this.dog.registrations || this.dog.registrations.length === 0) return;

    const courseTypeCount: Record<string, number> = {};
    this.dog.registrations.forEach(reg => {
      if (reg.course) {
        // Utilisons une approche plus sécurisée
        const courseType = reg.course.courseType.name || reg.course.description || 'Cours standard';
        courseTypeCount[courseType] = (courseTypeCount[courseType] || 0) + 1;
      }
    });

    let maxCount = 0;
    Object.entries(courseTypeCount).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        this.mostCommonCourseType = type;
      }
    });
  }

  selectDog() {
    this.dogService.setActiveDog(this.dog);
  }
}
