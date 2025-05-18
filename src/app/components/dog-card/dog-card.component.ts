import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { RouterModule } from '@angular/router';
import { Dog } from '../../models/dog';
import { DogService } from '../../service/dog.service';
import { differenceInMonths, differenceInYears } from 'date-fns';

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
    RouterModule
  ],
  templateUrl: './dog-card.component.html',
  styleUrl: './dog-card.component.scss'
})
export class DogCardComponent implements OnInit {
  @Input() dog!: Dog;

  latestWeight: any | undefined;
  hasMedication: boolean = false;
  areVaccinesUpToDate: boolean = false;
  favoriteCoach: string | null = null;
  mostCommonCourseType: string | null = null;
  bestFriends: { name: string, count: number }[] = [];

  constructor(public dogService: DogService) {}

  ngOnInit() {
    if (this.dog) {
      this.processWeights();
      this.checkMedication();
      this.checkVaccines();
      this.determineFavoriteCoach();
      this.determineMostCommonCourseType();
      this.determineBestFriends();
    }
  }

  // Réutilisation du code existant de DogSummaryComponent
  getDogAge(birthDate: string | Date | undefined): string | null {
    if (birthDate === undefined || birthDate === null) {
      return null;
    }
    const birth = new Date(birthDate);

    if (isNaN(birth.getTime())) {
      console.error('Invalid birth date provided to getDogAge:', birthDate);
      return null;
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
      return `${years} an(s)`;
    }
  }

  getBreedNames(): string {
    if (!this.dog.breeds || this.dog.breeds.length === 0) {
      return 'Race inconnue';
    }

    return this.dog.breeds.map(breed => breed.name).join(' × ');
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

  private determineBestFriends() {
    if (!this.dog.registrations || this.dog.registrations.length === 0) return;

    const friendDogCount: Record<string, { id: number, name: string, count: number }> = {};

    this.dog.registrations.forEach(reg => {
      if (reg.course?.registrations) {
        reg.course.registrations
          .filter(otherReg => otherReg.dog?.id !== this.dog.id)
          .forEach(otherReg => {
            if (otherReg.dog) {
              const dogId = String(otherReg.dog.id);
              if (!friendDogCount[dogId]) {
                friendDogCount[dogId] = {
                  id: otherReg.dog.id,
                  name: otherReg.dog.name,
                  count: 0
                };
              }
              friendDogCount[dogId].count += 1;
            }
          });
      }
    });

    this.bestFriends = Object.values(friendDogCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(friend => ({ name: friend.name, count: friend.count }));
  }

  // Méthode pour sélectionner ce chien comme chien actif
  selectDog() {
    this.dogService.setActiveDog(this.dog);
  }
}
