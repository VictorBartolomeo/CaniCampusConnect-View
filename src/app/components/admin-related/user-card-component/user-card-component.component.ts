import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    BadgeModule,
    ButtonModule
  ],
  templateUrl: './user-card-component.component.html',
  styleUrl: './user-card-component.component.scss'
})
export class UserCardComponent {
  @Input() user: any = null;
  @Output() editUser = new EventEmitter<any>();
  @Output() viewProfile = new EventEmitter<any>();

  private defaultAvatarUrl = '/img/avatars/user-default-avatar.png';

  /**
   * Obtenir l'URL de l'avatar de l'utilisateur (pas encore implémenté, mais ca vient)
   */
  getUserAvatarUrl(): string {
    if (this.user?.id && false) { // Désactivé temporairement
      return `http://localhost:8080/user/${this.user.id}/avatar`;
    }
    return this.defaultAvatarUrl;
  }

  /**
   * Gérer les erreurs de chargement d'image
   */
  onImageError(event: any): void {
    event.target.src = this.defaultAvatarUrl;
  }

  /**
   * Obtenir le label du rôle
   */
  getRoleLabel(role: string): string {
    switch (role) {
      case 'ROLE_OWNER':
        return 'Propriétaire';
      case 'ROLE_COACH':
        return 'Coach';
      case 'ROLE_CLUB_OWNER':
        return 'Administrateur';
      default:
        return role || 'Utilisateur';
    }
  }

  /**
   * Obtenir la sévérité du badge pour le rôle
   */
  getRoleSeverity(role: string | undefined | null): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    if (!role) {
      return 'secondary';
    }

    switch (role) {
      case 'ROLE_OWNER':
        return 'info';
      case 'ROLE_COACH':
        return 'success';
      case 'ROLE_CLUB_OWNER':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  /**
   * Émettre l'événement d'édition
   */
  onEditUser(): void {
    if (this.user) {
      this.editUser.emit(this.user);
    }
  }

  /**
   * Émettre l'événement de visualisation du profil
   */
  onViewProfile(): void {
    if (this.user) {
      this.viewProfile.emit(this.user);
    }
  }
}
