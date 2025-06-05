import {FormsModule} from '@angular/forms';
import {Component, OnInit, OnDestroy} from '@angular/core';
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
import {Observable, Subscription} from 'rxjs';
import {DropdownModule} from 'primeng/dropdown';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-dashboard-navbar',
  templateUrl: './dashboard-navbar.component.html',
  imports: [FormsModule, MegaMenu, ButtonModule, CommonModule, AvatarModule, Select, RouterLink, Menu, RouterOutlet, DropdownModule, Ripple],
  styleUrls: ['./dashboard-navbar.component.scss']
})
export class DashboardNavbarComponent implements OnInit, OnDestroy {

  items: MegaMenuItem[] | undefined;
  avatar: MegaMenuItem[] | undefined;

  userDogs$: Observable<Dog[]>;
  activeDog$: Observable<Dog | null>;
  selectedDogId: number | null = null;

  // ✅ AJOUT : Propriété locale pour le chien actif
  activeDog: Dog | null = null;
  private activeDogSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    public dogService: DogService,
    public userService: UserService,
  ) {
    this.userDogs$ = this.dogService.userDogs$;
    this.activeDog$ = this.dogService.activeDog$;
  }

  ngOnInit() {
    this.subscribeToActiveDog();
    this.initializeStaticItems();

    if (this.authService.getUserId()) {
      this.dogService.loadUserDogs();
    }

    // ✅ S'abonner aux changements d'owner pour mettre à jour le menu
    this.userService.owner$.subscribe(owner => {
      this.buildAvatarMenu();
    });
  }

  private subscribeToActiveDog(): void {
    this.activeDogSubscription = this.activeDog$.subscribe(dog => {
      this.activeDog = dog;
      this.selectedDogId = dog?.id || null;
    });
  }

  private initializeStaticItems(): void {
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
  }

  // ✅ Construire le menu avatar (appelé à chaque changement d'owner)
  private buildAvatarMenu(): void {
    this.avatar = [
      {
        label: this.userService.getFullName(), // ✅ Utilise directement la méthode du service
        styleClass: 'name-item',
        disabled: true
      },
      {
        label: 'Profile',
        icon: 'pi pi-user',
        routerLink: ["/dashboard/owner-profile"]
      },
      {
        label: 'Payements',
        icon: 'pi pi-credit-card',
        disabled: true
      },
      {
        label: this.authService.isDarkMode() ? 'Mode Clair' : 'Mode Sombre',
        icon: 'pi pi-palette',
        command: () => {
          this.authService.toggleDarkMode();
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
        command: () => this.authService.disconnection()
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.activeDogSubscription) {
      this.activeDogSubscription.unsubscribe();
    }
  }

  onDogChange(dogId: number): void {
    if (!dogId) return;

    this.dogService.getDogDetails(dogId).subscribe({
      next: (dogDetails) => {
        console.log('Chien sélectionné avec succès:', dogDetails.name);
      },
      error: (err) => console.error('Erreur lors du chargement des détails du chien:', err)
    });
  }
}
