import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUserPageComponent } from './dashboard-user-page.component';

describe('DashboardUserPageComponent', () => {
  let component: DashboardUserPageComponent;
  let fixture: ComponentFixture<DashboardUserPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardUserPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardUserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
