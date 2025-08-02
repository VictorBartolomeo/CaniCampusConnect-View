import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditFormComponentComponent } from './user-edit-form-component.component';

describe('UserEditFormComponentComponent', () => {
  let component: UserEditFormComponentComponent;
  let fixture: ComponentFixture<UserEditFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEditFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEditFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
