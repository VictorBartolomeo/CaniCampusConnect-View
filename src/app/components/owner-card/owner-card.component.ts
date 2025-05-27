import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { DogService } from '../../service/dog.service';
import { Owner } from '../../models/user';
import { Dog } from '../../models/dog';
import { differenceInDays, differenceInMonths, differenceInYears, format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-owner-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    AvatarModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    BadgeModule,
    DividerModule,
    RouterModule
  ],
  templateUrl: './owner-card.component.html',
  styleUrl: './owner-card.component.scss'
})
export class OwnerCardComponent implements OnInit {
  owner: Owner | undefined;
  userDogs: Dog[] = [];
  membershipDuration: string = '';

  constructor(
    private authService: AuthService,
    private dogService: DogService
  ) {}

  ngOnInit() {
    // Récupérer les informations du propriétaire
    this.authService.getUserInfo().subscribe({
      next: (ownerData) => {
        this.owner = ownerData;
        this.calculateMembershipDuration();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des informations du propriétaire:', err);
      }
    });

    // S'abonner aux chiens de l'utilisateur
    this.dogService.userDogs$.subscribe(dogs => {
      this.userDogs = dogs;
    });

    // Charger les chiens si ce n'est pas déjà fait
    if (this.dogService.userDogsSubject.getValue().length === 0) {
      this.dogService.loadUserDogs();
    }
  }

  private calculateMembershipDuration(): void {
    if (!this.owner?.registrationDate) return;

    const registrationDate = new Date(this.owner.registrationDate);
    const now = new Date();

    const years = differenceInYears(now, registrationDate);
    const months = differenceInMonths(now, registrationDate) % 12;
    const days = differenceInDays(now, registrationDate) % 30;

    if (years > 0) {
      this.membershipDuration = `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
    } else if (months > 0) {
      this.membershipDuration = `${months} mois et ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      this.membershipDuration = `${days} jour${days > 1 ? 's' : ''}`;
    }
  }

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return 'Date inconnue';

    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  }

  getFullName(): string {
    if (!this.owner) return '';
    return `${this.owner.firstname || ''} ${this.owner.lastname || ''}`.trim();
  }
}
