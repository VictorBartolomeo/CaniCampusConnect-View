import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {Tab, TabList, Tabs} from 'primeng/tabs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-dashboard-user-page',
  imports: [
    RouterOutlet,
    Tabs,
    Tab,
    RouterLink,
    TabList,
    FormsModule,
    RouterLinkActive,

  ],
  templateUrl: './dashboard-user-page.component.html',
  styleUrl: './dashboard-user-page.component.scss'
})
export class DashboardUserPageComponent {
  tabs = [
    { route: '/dashboard/user/course', label: 'Cours', icon: 'pi pi-calendar-clock' },
    { route: '/dashboard/user/calendar', label: 'Calendrier', icon: 'pi pi-calendar' },
    { route: '/dashboard/user/chat', label: 'Messagerie', icon: 'pi pi-comments', disabled: true },
    { route: '/dashboard/user/health-record', label: 'Carnet de Santé', icon: 'pi pi-chart-bar' }
  ];
  dates: Date[] | undefined;

  loading: boolean = false;

  load() {
    this.loading = true;

    setTimeout(() => {
      this.loading = false
    }, 2000);
  }
}
