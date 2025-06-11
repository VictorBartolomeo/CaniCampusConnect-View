import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachCalendarComponent } from './coach-calendar.component';

describe('CoachCalendarComponent', () => {
  let component: CoachCalendarComponent;
  let fixture: ComponentFixture<CoachCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoachCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
