import {Component} from '@angular/core';
import {CourseCardComponent} from '../../components/course-card/course-card.component';
import {PastCoursesComponent} from '../../components/past-courses/past-courses.component';

@Component({
  selector: 'app-course',
  imports: [
    CourseCardComponent,
    PastCoursesComponent
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent {

}
