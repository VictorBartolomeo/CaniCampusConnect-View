import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {CourseCardComponent} from '../../components/course-card/course-card.component';

@Component({
  selector: 'app-course',
  imports: [
    RouterOutlet,
    CourseCardComponent
  ],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent {

}
