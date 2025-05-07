import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeterinaryVisitsComponent } from './veterinary-visits.component';

describe('VeterinaryVisitsComponent', () => {
  let component: VeterinaryVisitsComponent;
  let fixture: ComponentFixture<VeterinaryVisitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeterinaryVisitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VeterinaryVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
