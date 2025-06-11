
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
import {RegistrationService} from '../../../service/registration.service';
import {Subject, takeUntil} from 'rxjs';
import {LayoutService} from '../../../service/layout.service';

@Component({
  selector: 'app-dashboard-navbar',
  templateUrl: './coach-dashboard-navbar.component.html',
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
  styleUrls: ['./coach-dashboard-navbar.component.scss']
})
export class CoachDashboardNavbarComponent implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private registrationManagementService = inject(RegistrationService);

  items: MegaMenuItem[] | undefined;
  avatar: MegaMenuItem[] | undefined;
  pendingRegistrationsCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private layoutService: LayoutService
    // ... vos autres dependencies
  ) {}


  ngOnInit() {
    this.initializeMenu();
    this.subscribeToPendingCount();
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
        route: '/coach/dashboard/general'
      },
      {
        label: 'Gérer les réservations',
        root: true,
        route: '/coach/dashboard/subscription-management',
        badge: this.pendingRegistrationsCount > 0 ? this.pendingRegistrationsCount.toString() : '0',
        badgeStyleClass: 'p-badge-warning'
      },
      {
        label: 'Paramètres',
        root: true,
        route: '/coach/dashboard/settings'
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
        route: "/dashboard/owner-profile"
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

  private subscribeToPendingCount() {
    this.registrationManagementService.pendingCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        console.log('🔔 Badge count received:', count);
        this.pendingRegistrationsCount = count;
        this.updateMenuBadge();
      });

    this.registrationManagementService.refreshPendingCount();
  }

  private updateMenuBadge() {
    if (this.items) {
      const reservationItem = this.items.find(item =>
        item['route'] === '/coach/dashboard/subscription-management'
      );

      if (reservationItem) {
        reservationItem.badge = this.pendingRegistrationsCount.toString();
        console.log('✅ Badge updated to:', reservationItem.badge);
      }
    }
  }

  // ✅ Correction: Suppression de undefined et valeur par défaut
  getBadgeSeverity(badgeStyleClass?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (!badgeStyleClass) return 'warn'; // Valeur par défaut au lieu de undefined

    if (badgeStyleClass.includes('warning')) return 'warn';
    if (badgeStyleClass.includes('danger')) return 'danger';
    if (badgeStyleClass.includes('success')) return 'success';
    if (badgeStyleClass.includes('info')) return 'info';
    if (badgeStyleClass.includes('secondary')) return 'secondary';
    if (badgeStyleClass.includes('contrast')) return 'contrast';

    return 'warn'; // Par défaut pour les warnings
  }
}
