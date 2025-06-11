import {Component} from '@angular/core';
import {CourseCardComponent} from '../../../components/owner-related/course-card/course-card.component';
import {PastCoursesComponent} from '../../../components/owner-related/past-courses/past-courses.component';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [
    CourseCardComponent,
    PastCoursesComponent,
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent {

}
