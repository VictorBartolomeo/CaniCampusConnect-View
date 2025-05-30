import {FormsModule} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {MegaMenuItem} from 'primeng/api';
import {MegaMenu} from 'primeng/megamenu';
import {ButtonModule} from 'primeng/button';
import {CommonModule} from '@angular/common';
import {AvatarModule} from 'primeng/avatar';
import {RouterLink, RouterOutlet} from '@angular/router';
import {Menu} from 'primeng/menu';
import {AuthService} from '../../../service/auth.service';
import {UserService} from '../../../service/user.service';
import {DropdownModule} from 'primeng/dropdown';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-dashboard-navbar',
  templateUrl: './coach-dashboard-navbar.component.html',
  imports: [FormsModule, MegaMenu, ButtonModule, CommonModule, AvatarModule, RouterLink, Menu, RouterOutlet, DropdownModule, Ripple],
  styleUrls: ['./coach-dashboard-navbar.component.scss']
})
export class CoachDashboardNavbarComponent implements OnInit {

  items: MegaMenuItem[] | undefined;
  avatar: MegaMenuItem[] | undefined;


  constructor(
    public authService: AuthService,
    public userService: UserService,
  ) {
  }


  ngOnInit() {

    this.items = [
      {
        label: 'Général',
        root: true,
        route: "/coach/dashboard/user"
      },
      {
        label: 'Gérer mes cours',
        root: true,
        route: "coach/dashboard/manage-courses"
      },
      {
        label: 'Paramètres',
        root: true,
        route: "coach/dashboard/settings"
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
        icon: 'pi pi-credit-card',
        disabled : true
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
}
