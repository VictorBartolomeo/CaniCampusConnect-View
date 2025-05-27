import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachDashboardNavbarComponent } from './coach-dashboard-navbar.component';

describe('CoachDashboardNavbarComponent', () => {
  let component: CoachDashboardNavbarComponent;
  let fixture: ComponentFixture<CoachDashboardNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachDashboardNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoachDashboardNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
