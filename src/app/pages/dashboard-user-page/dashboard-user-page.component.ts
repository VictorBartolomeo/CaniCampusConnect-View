import { Component } from '@angular/core';
import {DashboardNavbarComponent} from '../../components/dashboard-navbar/dashboard-navbar.component';

@Component({
  selector: 'app-dashboard-user-page',
  imports: [
    DashboardNavbarComponent
  ],
  templateUrl: './dashboard-user-page.component.html',
  styleUrl: './dashboard-user-page.component.scss'
})
export class DashboardUserPageComponent {

}
