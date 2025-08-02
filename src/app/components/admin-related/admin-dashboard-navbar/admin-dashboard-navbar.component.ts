import {FormsModule} from '@angular/forms';
import {Component, OnInit, OnDestroy, inject, ElementRef} from '@angular/core';
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
import {BadgeModule} from 'primeng/badge';
import {Subject, takeUntil} from 'rxjs';
import {LayoutService} from '../../../service/layout.service';

@Component({
  selector: 'app-admin-dashboard-navbar',
  imports: [
    FormsModule,
    MegaMenu,
    ButtonModule,
    CommonModule,
    AvatarModule,
    RouterLink,
    Menu,
    RouterOutlet,
    DropdownModule,
    Ripple,
    BadgeModule
  ],
  templateUrl: './admin-dashboard-navbar.component.html',
  styleUrl: './admin-dashboard-navbar.component.scss'
})
export class AdminDashboardNavbarComponent implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private userService = inject(UserService);

  items: MegaMenuItem[] | undefined;
  avatar: MegaMenuItem[] | undefined;

  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private layoutService: LayoutService
  ) {}

  ngOnInit() {
    this.initializeMenu();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const height = this.elementRef.nativeElement.offsetHeight;
      this.layoutService.setDashboardNavHeight(height);
    }, 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setDashboardNavHeight(0);
  }

  private initializeMenu() {
    this.items = [
      {
        label: 'Général',
        root: true,
        route: '/admin/dashboard/general'
      },
      {
        label: 'Gérer les coachs',
        root: true,
        route: '/admin/dashboard/manage-coaches'
      },
      {
        label: 'Gérer les utilisateurs',
        root: true,
        route: '/admin/dashboard/manage-users'
      },
      {
        label: 'Gérer les cours',
        root: true,
        route: '/admin/dashboard/manage-courses'
      },
      {
        label: 'Paramètres',
        root: true,
        route: '/admin/dashboard/settings'
      }
    ];

    this.avatar = [
      {
        label: this.userService.getFullName(),
        styleClass: 'name-item',
        disabled: true
      },
      {
        label: 'Profile',
        icon: 'pi pi-user',
        route: "/admin/dashboard/profile"
      },
      {
        label: 'Finances',
        icon: 'pi pi-credit-card',
        route: "/admin/dashboard/finances"
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

  getBadgeSeverity(badgeStyleClass?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (!badgeStyleClass) return 'warn';

    if (badgeStyleClass.includes('warning')) return 'warn';
    if (badgeStyleClass.includes('danger')) return 'danger';
    if (badgeStyleClass.includes('success')) return 'success';
    if (badgeStyleClass.includes('info')) return 'info';
    if (badgeStyleClass.includes('secondary')) return 'secondary';
    if (badgeStyleClass.includes('contrast')) return 'contrast';

    return 'warn';
  }
}
