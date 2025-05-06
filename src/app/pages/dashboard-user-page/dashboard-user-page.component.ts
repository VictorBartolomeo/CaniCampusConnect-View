import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {Tab, TabList, Tabs} from 'primeng/tabs';
import {FormsModule} from '@angular/forms';
import {DatePicker} from 'primeng/datepicker';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-dashboard-user-page',
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
  templateUrl: './dashboard-user-page.component.html',
  styleUrl: './dashboard-user-page.component.scss'
})
export class DashboardUserPageComponent {
  tabs = [
    { route: 'course', label: 'Cours', icon: 'pi pi-calendar-clock' },
    { route: 'chat', label: 'Messagerie', icon: 'pi pi-comments' },
    { route: 'health-record', label: 'Carnet de Santé', icon: 'pi pi-chart-bar' }
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
