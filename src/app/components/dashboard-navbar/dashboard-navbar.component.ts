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
import {RouterLink, RouterOutlet} from '@angular/router';
import {Menu} from 'primeng/menu';
import {User} from '../../models/user';
import {AuthService} from '../../service/auth.service';
import {DogService} from '../../service/dog.service';
import {Observable} from 'rxjs';
import {DropdownModule} from 'primeng/dropdown';
import {Ripple} from 'primeng/ripple';


@Component({
  selector: 'app-dashboard-navbar',
  templateUrl: './dashboard-navbar.component.html',
  imports: [FormsModule, MegaMenu, ButtonModule, CommonModule, AvatarModule, Select, RouterLink, Menu, RouterOutlet, DropdownModule, Ripple],
  styleUrls: ['./dashboard-navbar.component.scss']
})
export class DashboardNavbarComponent implements OnInit {

  items: MegaMenuItem[] | undefined;
  avatar: MegaMenuItem[] | undefined;

  userDogs$: Observable<Dog[]>;
  activeDog$: Observable<Dog | null>;
  selectedDogId: number | null = null;


  constructor(
    private authService: AuthService,
    public dogService: DogService
  ) {
    this.userDogs$ = this.dogService.userDogs$;
    this.activeDog$ = this.dogService.activeDog$;
    this.activeDog$.subscribe(dog => {
      this.selectedDogId = dog?.id || null;
    });

  }


  ngOnInit() {

    if (this.authService.getUserId()) {
      this.dogService.loadUserDogs();
    }

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
        label: 'placeholder name',
        styleClass: 'name-item'
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
        icon: 'pi pi-sign-out',
        route: '/login'
      }
    ];
  }

  onDogChange(dogId: number): void {
    // On a besoin de récupérer la liste actuelle des chiens
    const dogs = this.dogService.getActiveDog()?.id
      ? this.dogService.userDogsSubject.getValue() // Si on a besoin d'accéder directement à la liste
      : [];

    const selectedDog = dogs.find(d => d.id === +dogId);
    if (selectedDog) {
      this.dogService.setActiveDog(selectedDog);
    }
  }

}



