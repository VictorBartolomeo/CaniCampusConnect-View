import { Component } from '@angular/core';
import {
  CoachSubscriptionTableComponent
} from '../../../components/coach-related/coach-subscription-table/coach-subscription-table.component';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [
    CoachSubscriptionTableComponent
  ],
  templateUrl: './course-management.component.html',
  styleUrl: './course-management.component.scss'
})
export class CourseManagementComponent {

}
