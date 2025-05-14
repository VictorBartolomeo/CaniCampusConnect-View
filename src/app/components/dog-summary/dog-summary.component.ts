import {Component, inject, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {HttpClient} from '@angular/common/http';
import {Dog} from '../../models/dog';
import {differenceInMonths, differenceInYears} from 'date-fns';
import {User} from '../../models/user';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {Gender} from '../../models/gender';

@Component({
  selector: 'app-dog-summary',
  imports: [
    Card,
    Button,
    NgIf,
    NgForOf,
    NgClass
  ],
  templateUrl: './dog-summary.component.html',
  styleUrl: './dog-summary.component.scss'
})


export class DogSummaryComponent implements OnInit{
  http = inject(HttpClient)
  router= inject(Router);
  dogs: Dog[] = [];
  selectedDog: Dog | null = null;
  owner: User[] | null = null;
  mostCommonIssues: string[] = [];
  hasActiveTreatment: boolean = false;
  vaccinesUpToDate: boolean = false;


  ngOnInit() {
    this.http.get<Dog[]>('http://localhost:8080/owner/3/dogs').subscribe({
      next: (dogs) => {
        this.dogs = dogs;

        if (this.dogs.length > 0) {
          this.selectedDog = this.dogs[0];
        }
        console.log(dogs);
      },
      error: (error) => {
        console.error('Error fetching dogs:', error);
      },
    });

    this.http.get<User[]>('http://localhost:8080/user/3').subscribe({
      next: (owner) => {
        this.owner = owner;

        if (this.dogs.length > 0) {
          this.selectedDog = this.dogs[0];
        }
        console.log(owner);
      },
      error: (error) => {
        console.error('Error fetching dogs:', error);
      },
    });
  }

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
  // analyzeDogHealth(): void {
  //   if (!this.selectedDog) return;
  //
  //   // Analyser les types de problèmes les plus fréquents
  //   this.findMostCommonIssues();
  //
  //   // Vérifier le statut des vaccins
  //   this.checkVaccinationStatus();
  //
  //   // Vérifier s'il y a des traitements en cours
  //   this.checkActiveTreatments();
  // }
  //
  // findMostCommonIssues(): void {
  //   if (!this.selectedDog?.veterinaryVisits?.length) return;
  //
  //   // Grouper les visites par type de diagnostic
  //   const issueCount: {[key: string]: number} = {};
  //
  //   this.selectedDog.veterinaryVisits.forEach(visit => {
  //     const issueType = this.categorizeIssue(visit.diagnosis);
  //     issueCount[issueType] = (issueCount[issueType] || 0) + 1;
  //   });
  //
  //   // Convertir en tableau et trier par fréquence
  //   this.mostCommonIssues = Object.entries(issueCount)
  //     .sort((a, b) => b[1] - a[1])
  //     .map(entry => entry[0])
  //     .slice(0, 3); // Top 3 des problèmes
  // }
  //
  // categorizeIssue(diagnosis: string): string {
  //   // Version simplifiée qui retourne simplement le premier mot du diagnostic
  //   // (Dans une version plus avancée, on pourrait faire une catégorisation plus intelligente)
  //   const firstWord = diagnosis.split(' ')[0];
  //   return firstWord;
  // }
  //
  // checkVaccinationStatus(): void {
  //   if (!this.selectedDog?.vaccinations?.length) return;
  //
  //   const now = new Date();
  //
  //   // Un vaccin est considéré comme à jour si sa date d'expiration est dans le futur
  //   this.vaccinesUpToDate = this.selectedDog.vaccinations.every(vacc => {
  //     const vaccDate = new Date(vacc.vaccinationDate);
  //     const expiryDate = new Date(vaccDate);
  //     expiryDate.setMonth(expiryDate.getMonth() + vacc.vaccine.renewDelay);
  //     return expiryDate > now;
  //   });
  // }
  //
  // checkActiveTreatments(): void {
  //   if (!this.selectedDog?.medicationTreatments?.length) return;
  //
  //   const now = new Date();
  //
  //   // Un traitement est actif s'il n'a pas de date de fin ou si sa date de fin est dans le futur
  //   this.hasActiveTreatment = this.selectedDog.medicationTreatments.some(treatment => {
  //     return treatment.endDate === null || new Date(treatment.endDate) > now;
  //   });
  // }
  //
  // goToTreatments(): void {
  //   if (this.selectedDog) {
  //     this.router.navigate(['/dashboard/health-record', this.selectedDog.id]);
  //   }
  // }
  //
  // getLastWeight() {
  //   if (!this.selectedDog?.dogWeights?.length) return null;
  //
  //   // Trier les poids par date de mesure (du plus récent au plus ancien)
  //   const sortedWeights = [...this.selectedDog.dogWeights].sort((a, b) =>
  //     new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
  //   );
  //
  //   return sortedWeights[0];
  // }
  //
  //
  //
  //
  // protected readonly differenceInYears = differenceInYears;
  // protected readonly Gender = Gender;
}
