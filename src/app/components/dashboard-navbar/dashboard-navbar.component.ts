import {Component, OnInit} from '@angular/core'; // Ajout OnDestroy
import {Router, RouterLink, RouterLinkActive} from '@angular/router';

// Importer les définitions et services nécessaires (adaptez les chemins)
import {Dog} from '../../models/dog';
import {User} from '../../models/user';
import {MatToolbar} from '@angular/material/toolbar';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDivider} from '@angular/material/divider';
import {MatTabLink, MatTabNav, MatTabNavPanel} from '@angular/material/tabs';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {NgOptimizedImage, SlicePipe} from '@angular/common';

@Component({
  selector: 'app-dashboard-navbar',
  templateUrl: './dashboard-navbar.component.html',
  imports: [
    MatToolbar,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatIcon,
    MatMenuItem,
    MatDivider,
    MatTabNav,
    MatTabLink,
    RouterLink,
    RouterLinkActive,
    MatIconButton,
    MatButton,
    MatTabNavPanel,
    NgOptimizedImage,
    SlicePipe
  ],
  styleUrls: ['./dashboard-navbar.component.scss']
})
export class DashboardNavbarComponent implements OnInit {

  public HARDCODED_USER: User = {
    id: 1,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    avatarUrl: 'img/avatars/user-default-avatar.svg'
  };

  public HARDCODED_DOGS: Dog[] = [
    {
      id: 101,
      name: 'Charlie de la tour Brune',
      avatarUrl: '/img/avatars/dog-default-avatar.svg',
      breed: {id: 1, name: 'Carlin'}
    },
    {
      id: 102,
      name: 'Bella Scie à Eau',
      avatarUrl: '/img/avatars/dog-default-avatar.svg',
      breed: {id: 2, name: 'Labrador'}
    },
    {
      id: 103,
      name: 'Max le Costaud',
      avatarUrl: '/img/avatars/dog-default-avatar.svg',
      breed: {id: 3, name: 'Beagle'}
    }
  ];

  clientDogs: Dog[] = [];
  currentDog: Dog | null = null;
  currentUser: User | null = null;

  navigationLinks = [
    {label: 'Général', route: '/general'},
    {label: 'Gérer mon chien', route: '/profil/mes-chiens'},
    {label: 'Réserver un cours', route: '/cours/reservation'},
    {label: 'Paramètres', route: '/profil/parametres'}
  ];

  // Injecter SEULEMENT le Router (plus besoin des services de données)
  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.currentUser = this.HARDCODED_USER;
    this.clientDogs = this.HARDCODED_DOGS;

    if (this.clientDogs.length > 0) {
      this.currentDog = this.clientDogs[0];
    } else {
      this.currentDog = null;
    }
    console.log('Données initialisées (en dur):', {
      user: this.currentUser,
      dogs: this.clientDogs,
      selectedDog: this.currentDog
    });
  }

  selectDog(dog: Dog): void {
    if (this.currentDog?.id !== dog.id) {
      this.currentDog = dog;
      console.log('Chien sélectionné (en dur):', this.currentDog);
    }
  }

  onAddDog(): void {
    console.log("Navigation vers la page d'ajout de chien...");
    this.router.navigate(['/profil/mes-chiens/ajouter']);
  }

  viewProfile(): void {
    console.log("Navigation vers le profil utilisateur...");
    this.router.navigate(['/profil/mon-compte']);
  }

  accountSettings(): void {
    console.log("Navigation vers les paramètres du compte...");
    this.router.navigate(['/profil/parametres-compte']);
  }

  logout(): void {
    console.log("Déconnexion (simulation)...");
    // Simuler la déconnexion en effaçant les données locales du composant
    this.currentUser = null;
    this.currentDog = null;
    this.clientDogs = []; // Vider la liste des chiens
    // Rediriger vers une page de "connexion" (qui sera peut-être juste une autre page statique)
    this.router.navigate(['/login']); // Adaptez si nécessaire
  }

}
