import {Component} from '@angular/core';
import {DashboardNavbarComponent} from '../../components/dashboard-navbar/dashboard-navbar.component';
import {CourseCardComponent} from '../../components/course-card/course-card.component';

@Component({
  selector: 'app-dashboard-user-page',
  standalone:true,
  imports: [
    DashboardNavbarComponent,
    CourseCardComponent
  ],
  templateUrl: './dashboard-user-page.component.html',
  styleUrl: './dashboard-user-page.component.scss'
})
export class DashboardUserPageComponent {

}
