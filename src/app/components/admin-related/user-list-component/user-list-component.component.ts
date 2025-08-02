import {ConfirmationService, MessageService} from 'primeng/api';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {BadgeModule} from 'primeng/badge';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {TooltipModule} from 'primeng/tooltip';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ToastModule} from 'primeng/toast';
import {Paginator} from 'primeng/paginator';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    BadgeModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    Paginator
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-list-component.component.html',
  styleUrl: './user-list-component.component.scss'
})
export class UserListComponent implements OnInit {
  @Input() users: any[] = [];
  @Input() loading: boolean = false;

  @Output() userSelected = new EventEmitter<any>();
  @Output() userEdit = new EventEmitter<any>();
  @Output() userDelete = new EventEmitter<any>();
  @Output() addUserRequest = new EventEmitter<void>();

  filteredUsers: any[] = [];
  searchQuery: string = '';
  selectedRole: any = null;

  // Filter options
  userRoles: any[] = [
    { label: 'Tous les rôles', value: null },
    { label: 'Propriétaires', value: 'ROLE_OWNER' },
    { label: 'Coachs', value: 'ROLE_COACH' },
    { label: 'Administrateurs', value: 'ROLE_CLUB_OWNER' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.filteredUsers = [...this.users];
    console.log('🎯 UserListComponent initialisé avec', this.users.length, 'utilisateurs');
  }

  ngOnChanges() {
    console.log('🔄 UserListComponent - Changement détecté:', {
      usersCount: this.users.length,
      users: this.users
    });

    this.filteredUsers = [...this.users];
    this.filterUsers();
  }

  filterUsers() {
    console.log('🔍 Filtrage avec:', {
      selectedRole: this.selectedRole,
      searchQuery: this.searchQuery,
      totalUsers: this.users.length
    });

    this.filteredUsers = this.users.filter(user => {
      console.log('🔍 Vérification utilisateur:', {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
        role: user.role
      });

      // Filter by role if selected
      if (this.selectedRole && user.role !== this.selectedRole) {
        console.log('❌ Filtré par rôle:', user.role, '!==', this.selectedRole);
        return false;
      }

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const matches = (
          user.firstname?.toLowerCase().includes(query) ||
          user.lastname?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.includes(query)
        );

        if (!matches) {
          console.log('❌ Filtré par recherche:', query);
          return false;
        }
      }

      console.log('✅ Utilisateur conservé');
      return true;
    });

    console.log('✅ Résultat filtrage:', this.filteredUsers.length, 'utilisateurs');
  }

  resetFilters() {
    console.log('🔄 Reset des filtres');
    this.selectedRole = null;
    this.searchQuery = '';
    this.filteredUsers = [...this.users];
  }

  onUserSelect(user: any) {
    this.userSelected.emit(user);
  }

  onUserEdit(user: any) {
    this.userEdit.emit(user);
  }

  onUserDelete(user: any) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstname} ${user.lastname} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.userDelete.emit(user);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Utilisateur supprimé avec succès'
        });
      }
    });
  }

  onAddUser() {
    this.addUserRequest.emit();
  }

  getRoleLabel(role: string): string {
    const roleOption = this.userRoles.find(r => r.value === role);
    return roleOption ? roleOption.label : role || 'Utilisateur';
  }

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
}
