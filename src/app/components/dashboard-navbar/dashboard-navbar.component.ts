import {FormsModule} from '@angular/forms';
import {Component, inject, OnInit} from '@angular/core';
import {MegaMenuItem} from 'primeng/api';
import {MegaMenu} from 'primeng/megamenu';
import {ButtonModule} from 'primeng/button';
import {CommonModule} from '@angular/common';
import {AvatarModule} from 'primeng/avatar';
import {Select} from 'primeng/select';
import {Dog} from '../../models/dog';
import {HttpClient} from '@angular/common/http';
import {RouterLink} from '@angular/router';
import {Menu} from 'primeng/menu';
import {User} from '../../models/user';


@Component({
  selector: 'app-dashboard-navbar',
  templateUrl: './dashboard-navbar.component.html',
  imports: [FormsModule, MegaMenu, ButtonModule, CommonModule, AvatarModule, Select, RouterLink, Menu],
  styleUrls: ['./dashboard-navbar.component.scss']
})
export class DashboardNavbarComponent implements OnInit {
  http = inject(HttpClient);

  items: MegaMenuItem[] | undefined;
  avatar: MegaMenuItem[] | undefined;

  dogs: Dog[] = [];
  selectedDog: Dog = this.dogs[0];

  user: User = {
    id: 0,
    firstname: '',
    lastname: '',
    email: ''
  };


  ngOnInit() {

    this.http.get<Dog[]>('http://localhost:8080/owner/3/dogs').subscribe({
      next: (dogs) => {
        this.dogs = dogs;
        if (this.dogs.length > 0) {
          this.selectedDog = this.dogs[0];
        }
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });

    this.http.get<User>('http://localhost:8080/user/3').subscribe({
      next: (user) => {
        this.user = user;
        console.log(this.user.firstname);
        console.log(this.user.lastname);
        console.log(this.user.email);

        if (this.avatar) {
          const userNameAvatar = this.avatar.find(item => item.label === 'placeholder name'); // Trouver l'item 'Profil' par son icône
          if (userNameAvatar) {
            userNameAvatar.label = `${this.user.firstname} ${this.user.lastname}`;
          }
        }
        },
      error: (error) => {
        console.error('Error fetching courses:', error);
      },
    });

    this.items = [
      {
        label: 'Général',
        root: true,
        route: "/dashboard"
      },
      {
        label: 'Gérer mon chien',
        root: true,
        route: "/dashboard/manage-dog"
      },
      {
        label: 'Réserver un cours',
        root: true,
        route: "/dashboard/reserve-course"
      },
      {
        label: 'Paramètres',
        root: true,
        route: "/dashboard/settings"
      }
    ];

    this.avatar = [
      {
        label : 'placeholder name',
        styleClass : 'name-item'
      },
      {
        label: 'Profile',
        icon: 'pi pi-user'
      },
      {
        label: 'Payements',
        icon: 'pi pi-credit-card'
      },
      {
        label: 'Apparence',
        icon: 'pi pi-palette'
      },
      {
        label: 'Aide',
        icon: 'pi pi-question-circle'
      },
      {
        label: 'Déconnexion',
        icon: 'pi pi-sign-out'
      }
    ];
  }


}
