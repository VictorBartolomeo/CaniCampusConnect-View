import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardNavbarComponent } from './admin-dashboard-navbar.component';

describe('AdminDashboardNavbarComponent', () => {
  let component: AdminDashboardNavbarComponent;
  let fixture: ComponentFixture<AdminDashboardNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboardNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
