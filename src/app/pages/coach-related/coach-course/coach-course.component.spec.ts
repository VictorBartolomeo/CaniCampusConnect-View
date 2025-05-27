import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachCourseComponent } from './coach-course.component';

describe('CoachCourseComponent', () => {
  let component: CoachCourseComponent;
  let fixture: ComponentFixture<CoachCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachCourseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoachCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
