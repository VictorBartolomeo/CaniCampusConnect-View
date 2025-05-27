import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DogAddFormComponent } from './dog-add-form.component';

describe('DogAddFormComponent', () => {
  let component: DogAddFormComponent;
  let fixture: ComponentFixture<DogAddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogAddFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DogAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
