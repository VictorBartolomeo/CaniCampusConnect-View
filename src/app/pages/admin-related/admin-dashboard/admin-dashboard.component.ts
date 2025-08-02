import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Tab, TabList, Tabs} from 'primeng/tabs';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterOutlet, CommonModule, Tab, TabList, Tabs, RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  tabs = [
    { route: '/admin/dashboard/general/business-intelligence', label: 'CaniBI', icon: 'pi pi-calendar-clock' },
    { route: '/admin/dashboard/calendar', label: 'Calendrier', icon: 'pi pi-calendar' },
    { route: '/admin/dashboard/chat', label: 'Messagerie', icon: 'pi pi-comments', disabled: true },
    { route: '/admin/dashboard/health-record', label: 'Carnet de Santé', icon: 'pi pi-chart-bar' }
  ];
}
