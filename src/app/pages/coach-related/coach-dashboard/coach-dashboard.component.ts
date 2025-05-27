import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {Tab, TabList, Tabs} from 'primeng/tabs';
import {FormsModule} from '@angular/forms';
import {DatePicker} from 'primeng/datepicker';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-coach-dashboard',
  imports: [
    RouterOutlet,
    Tabs,
    Tab,
    RouterLink,
    TabList,
    FormsModule,
    DatePicker,
    Button
  ],
  templateUrl: './coach-dashboard.component.html',
  styleUrl: './coach-dashboard.component.scss'
})
export class CoachDashboardComponent {
  tabs = [
    { route: '/coach/dashboard/user/course', label: 'Cours', icon: 'pi pi-calendar-clock' },
    { route: '/coach/dashboard/user/chat', label: 'Messagerie', icon: 'pi pi-comments', disabled: true },
    { route: '/coach/dashboard/user/health-record', label: 'Carnet de Santé', icon: 'pi pi-chart-bar' }
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
