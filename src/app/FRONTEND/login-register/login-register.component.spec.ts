import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginRegisterComponent } from './login-register.component';

describe('LoginRegisterComponent', () => {
  let component: LoginRegisterComponent;
  let fixture: ComponentFixture<LoginRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show errors when fields are empty', () => {
    component.username = '';
    component.email = '';
    component.password = '';
    component.confirmPassword = '';

    component.onSubmit();

    expect(component.usernameError).toBeTrue();
    expect(component.emailError).toBeTrue();
    expect(component.passwordError).toBeTrue();
    expect(component.confirmPasswordMismatchError).toBeFalse();
  });
});
