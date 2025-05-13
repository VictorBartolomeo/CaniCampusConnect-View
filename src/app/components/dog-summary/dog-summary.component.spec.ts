import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DogSummaryComponent } from './dog-summary.component';

describe('DogSummaryComponent', () => {
  let component: DogSummaryComponent;
  let fixture: ComponentFixture<DogSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DogSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
