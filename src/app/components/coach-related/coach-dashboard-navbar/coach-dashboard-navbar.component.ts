
import {FormsModule} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {MegaMenuItem} from 'primeng/api';
import {MegaMenu} from 'primeng/megamenu';
import {ButtonModule} from 'primeng/button';
import {CommonModule} from '@angular/common';
import {AvatarModule} from 'primeng/avatar';
import {Select} from 'primeng/select';
import {Dog} from '../../../models/dog';
import {RouterLink, RouterOutlet} from '@angular/router';
import {Menu} from 'primeng/menu';
import {AuthService} from '../../../service/auth.service';
import {DogService} from '../../../service/dog.service';
import {UserService} from '../../../service/user.service';
import {Observable} from 'rxjs';
import {DropdownModule} from 'primeng/dropdown';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-dashboard-navbar',
  templateUrl: './coach-dashboard-navbar.component.html',
  imports: [FormsModule, MegaMenu, ButtonModule, CommonModule, AvatarModule, Select, RouterLink, Menu, RouterOutlet, DropdownModule, Ripple],
  styleUrls: ['./coach-dashboard-navbar.component.scss']
})
export class CoachDashboardNavbarComponent implements OnInit {

  items: MegaMenuItem[] | undefined;
  avatar: MegaMenuItem[] | undefined;

  userDogs$: Observable<Dog[]>;
  activeDog$: Observable<Dog | null>;
  selectedDogId: number | null = null;


  constructor(
    public authService: AuthService,
    public dogService: DogService,
    public userService: UserService,
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
        route: "/coach/dashboard"
      },
      {
        label: 'Gérer mes cours',
        root: true,
        route: "/dashboard/manage-courses"
      },
      {
        label: 'Paramètres',
        root: true,
        route: "/dashboard/settings"
      }
    ];

    this.avatar = [
      {
        label: this.userService.getFullName(),
        styleClass: 'name-item',
        disabled:true
      },
      {
        label: 'Profile',
        icon: 'pi pi-user',
        routerLink: ["/dashboard/owner-profile"]
      },
      {
        label: 'Payements',
        icon: 'pi pi-credit-card'
      },
      {
        label: this.authService.isDarkMode() ? 'Mode Clair' : 'Mode Sombre',
        icon: 'pi pi-palette',
        command: () => {
          this.authService.toggleDarkMode();
          // Mettre à jour le libellé du menu
          const themeItem = this.avatar?.find(item => item.icon === 'pi pi-palette');
          if (themeItem) {
            themeItem.label = this.authService.isDarkMode() ? 'Mode Clair' : 'Mode Sombre';
          }
        }
      },
      {
        label: 'Aide',
        icon: 'pi pi-question-circle'
      },
      {
        label: 'Déconnexion',
        icon: 'pi pi-sign-out',
        command: ()=> this.authService.disconnection()
      }
    ];
  }

  onDogChange(dogId: number): void {
    if (!dogId) return;

    // Charger les détails complets du chien sélectionné
    this.dogService.getDogDetails(dogId).subscribe({
      next: (dogDetails) => {
        // Les détails du chien sont maintenant disponibles via activeDog$ pour tous les composants
        console.log('Chien sélectionné avec succès:', dogDetails.name);
      },
      error: (err) => console.error('Erreur lors du chargement des détails du chien:', err)
    });
  }
}
