
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { UserService } from '../../../service/user.service';
import { AuthService } from '../../../service/auth.service';
import { DogService } from '../../../service/dog.service';
import { Owner } from '../../../models/user';

@Component({
  selector: 'app-owner-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,        // ✅ Pour routerLink
    CardModule,
    BadgeModule,
    ButtonModule,
    AvatarModule,      // ✅ Pour p-avatar
    TagModule,         // ✅ Pour p-tag
    DividerModule      // ✅ Pour p-divider
  ],
  templateUrl: './owner-card.component.html',
  styleUrl: './owner-card.component.scss'
})
export class OwnerCardComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private dogService = inject(DogService);

  owner: Owner | null = null;
  userDogs: any[] = [];

  ngOnInit() {
    // Récupérer les données du propriétaire
    this.userService.owner$.subscribe({
      next: (ownerData: Owner | null) => {
        this.owner = ownerData;
        console.log('Owner data loaded in card:', this.owner);
      },
      error: (err: any) => {
        console.error('Error loading owner data:', err);
      }
    });

    // ✅ Récupérer les chiens de l'utilisateur
    this.dogService.userDogs$.subscribe({
      next: (dogs: any[]) => {
        this.userDogs = dogs;
        console.log('User dogs loaded in card:', this.userDogs);
      },
      error: (err: any) => {
        console.error('Error loading user dogs:', err);
      }
    });
  }

  get fullName(): string {
    return this.userService.getFullName(this.owner);
  }

  get initials(): string {
    if (!this.owner) return '';

    const firstInitial = this.owner.firstname?.charAt(0)?.toUpperCase() || '';
    const lastInitial = this.owner.lastname?.charAt(0)?.toUpperCase() || '';

    return `${firstInitial}${lastInitial}`;
  }

  get registrationDate(): string {
    if (!this.owner?.registrationDate) return '';

    try {
      const date = new Date(this.owner.registrationDate);
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Error formatting registration date:', error);
      return '';
    }
  }

  get membershipDuration(): string {
    if (!this.owner?.registrationDate) return '';

    try {
      const registrationDate = new Date(this.owner.registrationDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - registrationDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} mois`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} an${years > 1 ? 's' : ''}`;
      }
    } catch (error) {
      console.error('Error calculating membership duration:', error);
      return '';
    }
  }

  // ✅ Méthode pour formater une date (utilisée dans le template)
  getFormattedDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  isDarkMode(): boolean {
    return this.authService.isDarkMode();
  }
}
