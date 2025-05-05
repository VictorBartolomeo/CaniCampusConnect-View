import {Component} from '@angular/core';
import {CourseCardComponent} from '../../components/course-card/course-card.component';

@Component({
  selector: 'app-dashboard-user-page',
  standalone:true,
  imports: [
    CourseCardComponent
  ],
  templateUrl: './dashboard-user-page.component.html',
  styleUrl: './dashboard-user-page.component.scss'
})
export class DashboardUserPageComponent {

}
