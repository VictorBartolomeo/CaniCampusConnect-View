import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerSettingsComponent } from './owner-settings.component';

describe('OwnerSettingsComponent', () => {
  let component: OwnerSettingsComponent;
  let fixture: ComponentFixture<OwnerSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
