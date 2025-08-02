
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../service/admin.service';
import {UserListComponent} from '../../../components/admin-related/user-list-component/user-list-component.component';
import {UserCardComponent} from '../../../components/admin-related/user-card-component/user-card-component.component';
import {
  UserRegisterFormComponent
} from '../../../components/admin-related/utilities/user-register-form-component/user-register-form-component.component';
import {
  UserEditFormComponent
} from '../../../components/admin-related/utilities/user-edit-form-component/user-edit-form-component.component';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    UserListComponent,
    UserCardComponent,
    UserEditFormComponent,
    UserRegisterFormComponent
  ],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss'
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  loading: boolean = true;
  selectedUser: any = null;
  editFormVisible: boolean = false;
  userToEdit: any = null;

  @ViewChild(UserRegisterFormComponent) userForm!: UserRegisterFormComponent;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
    this.adminService.users$.subscribe(users => {
      this.users = users;
      if (this.selectedUser) {
        const updatedSelectedUser = users.find(user => user.id === this.selectedUser.id);
        if (updatedSelectedUser) {
          this.selectedUser = updatedSelectedUser;
        }
      }
    });
  }

  loadUsers() {
    this.loading = true;
    console.log('Loading users...');
    this.adminService.loadUsers().subscribe({
      next: () => {
        console.log('Users loaded successfully');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  showAddUserDialog() {
    if (this.userForm) {
      this.userForm.showDialog();
    }
  }

  showUserDetails(user: any) {
    this.selectedUser = user;
  }

  editUser(user: any) {
    console.log('🔧 Editing user:', user);

    // Reset the form state before setting a new user
    this.editFormVisible = false;
    this.userToEdit = null;

    // Use setTimeout to ensure the form is reset before setting new values
    setTimeout(() => {
      console.log('🔧 Setting userToEdit to:', user);
      this.userToEdit = { ...user }; // Créer une copie pour éviter les références
      console.log('🔧 Setting editFormVisible to true');
      this.editFormVisible = true;
    }, 0);
  }

  onUserUpdated(updatedUser: any) {
    console.log('User updated successfully:', updatedUser);

    // Mettre à jour la liste des utilisateurs via AdminService
    this.adminService.updateUser(updatedUser).subscribe({
      next: () => {
        console.log('User list updated successfully');
      },
      error: (error) => {
        console.error('Error updating user list:', error);
        // Recharger la liste en cas d'erreur
        this.loadUsers();
      }
    });
  }

  onUserAdded(newUser: any) {
    console.log('User added:', newUser);
  }

  deleteUser(user: any) {
    console.log('🗑️ Deleting user:', user);

    if (!user || !user.id) {
      console.error('Invalid user or missing ID');
      return;
    }

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        console.log('User deleted successfully');

        // If the deleted user was the selected user, clear the selection
        if (this.selectedUser && this.selectedUser.id === user.id) {
          this.selectedUser = null;
        }
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        // Reload users in case of error
        this.loadUsers();
      }
    });
  }
}
