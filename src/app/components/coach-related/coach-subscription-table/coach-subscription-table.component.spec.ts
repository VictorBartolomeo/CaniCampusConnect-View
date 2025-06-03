import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachSubscriptionTableComponent } from './coach-subscription-table.component';

describe('CoachSubscriptionTableComponent', () => {
  let component: CoachSubscriptionTableComponent;
  let fixture: ComponentFixture<CoachSubscriptionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachSubscriptionTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoachSubscriptionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
