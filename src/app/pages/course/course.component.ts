import {Component} from '@angular/core';
import {CourseCardComponent} from '../../components/course-card/course-card.component';
import {PastCoursesComponent} from '../../components/past-courses/past-courses.component';
import {CalendarComponent} from '../../components/calendar/calendar.component';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [
    CourseCardComponent,
    PastCoursesComponent,
    CalendarComponent
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent {

}
