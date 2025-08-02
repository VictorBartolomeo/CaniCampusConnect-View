import { ComponentFixture, TestBed } from '@angular/core/testing';

import {CourseRegisterFormComponent} from './course-register-form-component.component';

describe('CourseRegisterFormComponentComponent', () => {
  let component: CourseRegisterFormComponent;
  let fixture: ComponentFixture<CourseRegisterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseRegisterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseRegisterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
