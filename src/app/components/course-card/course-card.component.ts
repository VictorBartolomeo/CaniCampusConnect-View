import {Component, inject} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-course-card',
  imports: [MatCardModule],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss'
})
export class CourseCardComponent implements ngOnInit {

  http = inject(HttpClient);
  course: Course[]= [];

  ngOnInit() {
    this.http.get<Course[]>("http://localhost:8080/course")
      .subscribe(course => {
        this.course = course;
      })
  }

  onClick(products: any) {
    alert("Vous avez payé " + course.price + "€ pour un " + course.name)
  }
}
