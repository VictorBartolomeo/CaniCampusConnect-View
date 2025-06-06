import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralConditionsUseComponent } from './general-conditions-use.component';

describe('GeneralConditionsUseComponent', () => {
  let component: GeneralConditionsUseComponent;
  let fixture: ComponentFixture<GeneralConditionsUseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralConditionsUseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralConditionsUseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
