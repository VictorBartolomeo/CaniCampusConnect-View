import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRegisterFormComponentComponent } from './user-register-form-component.component';

describe('UserRegisterFormComponentComponent', () => {
  let component: UserRegisterFormComponentComponent;
  let fixture: ComponentFixture<UserRegisterFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRegisterFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRegisterFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
