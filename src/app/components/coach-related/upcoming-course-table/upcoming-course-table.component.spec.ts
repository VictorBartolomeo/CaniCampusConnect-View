import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingCourseTableComponent } from './upcoming-course-table.component';

describe('UpcomingCourseTableComponent', () => {
  let component: UpcomingCourseTableComponent;
  let fixture: ComponentFixture<UpcomingCourseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingCourseTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingCourseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
