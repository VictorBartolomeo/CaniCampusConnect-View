import {Component} from '@angular/core';
import {LandingNavbarComponent} from '../../components/landing-navbar/landing-navbar.component';
import {CourseCardComponent} from '../../components/owner-related/course-card/course-card.component';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-landing-page',
  imports: [LandingNavbarComponent, CourseCardComponent, Button],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
