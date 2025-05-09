import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastCoursesComponent } from './past-courses.component';

describe('PastCoursesComponent', () => {
  let component: PastCoursesComponent;
  let fixture: ComponentFixture<PastCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastCoursesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PastCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
