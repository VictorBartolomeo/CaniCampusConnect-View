import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachCoursesCardComponent } from './coach-courses-card.component';

describe('CoachCoursesCardComponent', () => {
  let component: CoachCoursesCardComponent;
  let fixture: ComponentFixture<CoachCoursesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachCoursesCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoachCoursesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
