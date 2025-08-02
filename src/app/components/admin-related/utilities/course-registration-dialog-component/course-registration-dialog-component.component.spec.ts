import { ComponentFixture, TestBed } from '@angular/core/testing';

import {CourseRegistrationsDialogComponent} from './course-registration-dialog-component.component';

describe('CourseRegistrationDialogComponentComponent', () => {
  let component: CourseRegistrationsDialogComponent;
  let fixture: ComponentFixture<CourseRegistrationsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseRegistrationsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseRegistrationsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
