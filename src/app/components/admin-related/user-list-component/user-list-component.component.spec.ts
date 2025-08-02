import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListComponentComponent } from './user-list-component.component';

describe('UserListComponentComponent', () => {
  let component: UserListComponentComponent;
  let fixture: ComponentFixture<UserListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
