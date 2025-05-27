import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDogsPageComponent } from './manage-dogs-page.component';

describe('ManageDogsPageComponent', () => {
  let component: ManageDogsPageComponent;
  let fixture: ComponentFixture<ManageDogsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDogsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDogsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
