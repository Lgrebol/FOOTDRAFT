import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ElementRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from '../Serveis/user.service';
import { LoginRegisterComponent } from '../Components/login-register/login-register.component';
import { User } from '../Classes/user/user.model';

describe('LoginRegisterComponent', () => {
  let component: LoginRegisterComponent;
  let fixture: ComponentFixture<LoginRegisterComponent>;
  let router: jasmine.SpyObj<Router>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['refreshCurrentUserData', 'registerUser', 'loginUser']);

    await TestBed.configureTestingModule({
      imports: [LoginRegisterComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginRegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call registerUser when form is valid', () => {
    // Assignem les dades al userModel
    component.userModel.username = 'TestUser';
    component.userModel.email = 'test@example.com';
    component.userModel.password = 'Password123!';
    component.userModel.confirmPassword = 'Password123!';

    userService.registerUser.and.returnValue(of({ success: true }));

    component.onSubmit();

    expect(userService.registerUser).toHaveBeenCalledWith(jasmine.objectContaining({
      username: 'TestUser',
      email: 'test@example.com',
      password: 'Password123!'
    }));
  });

  it('should return true if passwords match', () => {
    component.userModel.password = 'Password123!';
    component.userModel.confirmPassword = 'Password123!';
    expect(component.userModel.isPasswordMatch()).toBeTrue();
  });

  it('should return false if passwords do not match', () => {
    component.userModel.password = 'Password123!';
    component.userModel.confirmPassword = 'WrongPassword!';
    expect(component.userModel.isPasswordMatch()).toBeFalse();
  });

  it('should return true for valid passwords', () => {
    component.userModel.password = 'Password123!';
    expect(component.userModel.isValidPassword()).toBeTrue();
  });

  it('should return false for short passwords', () => {
    component.userModel.password = 'Pass!';
    expect(component.userModel.isValidPassword()).toBeFalse();
  });

  it('should return false for passwords without special characters', () => {
    component.userModel.password = 'Password123';
    expect(component.userModel.isValidPassword()).toBeFalse();
  });

  it('should clear input fields', () => {
    component.userModel.username = 'TestUser';
    component.userModel.email = 'test@example.com';
    component.userModel.password = 'Password123!';
    component.userModel.confirmPassword = 'Password123!';

    // Utilitzem casting a any per accedir al mètode privat clearForm()
    (component as any).clearForm();

    expect(component.userModel.username).toBe('');
    expect(component.userModel.email).toBe('');
    expect(component.userModel.password).toBeUndefined();
    expect(component.userModel.confirmPassword).toBeUndefined();
  });

  it('should toggle sign-up-mode class on container when clicking sign-up and sign-in buttons', () => {
    const containerDiv = document.createElement('div');
    const signUpBtn = document.createElement('button');
    const signInBtn = document.createElement('button');

    component.container = new ElementRef(containerDiv);
    component.signUpBtn = new ElementRef(signUpBtn);
    component.signInBtn = new ElementRef(signInBtn);

    component.ngAfterViewInit();

    // Simulem clic al botó sign-up: s'afegeix la classe 'sign-up-mode'
    signUpBtn.click();
    expect(containerDiv.classList.contains('sign-up-mode')).toBeTrue();

    // Simulem clic al botó sign-in: s'elimina la classe 'sign-up-mode'
    containerDiv.classList.add('sign-up-mode');
    signInBtn.click();
    expect(containerDiv.classList.contains('sign-up-mode')).toBeFalse();
  });

  it('should call loginUser, set token, refresh user data and navigate on successful login', () => {
    component.userModel.email = 'test@example.com';
    component.userModel.password = 'Password123!';

    userService.loginUser.and.returnValue(of({ token: 'testToken123' }));
    // Es retorna un usuari vàlid per satisfer la tipificació Observable<User>
    userService.refreshCurrentUserData.and.returnValue(of(new User('123', 'TestUser', 'test@example.com', 100)));
    spyOn(localStorage, 'setItem');

    component.handleSignIn();

    expect(userService.loginUser).toHaveBeenCalledWith(component.userModel);
    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'testToken123');
    expect(userService.refreshCurrentUserData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not call loginUser if email or password is missing in handleSignIn', () => {
    spyOn(console, 'error');

    // Cas amb email buit
    component.userModel.email = '';
    component.userModel.password = 'Password123!';
    component.handleSignIn();
    expect(userService.loginUser).not.toHaveBeenCalled();

    userService.loginUser.calls.reset();

    // Cas amb contrasenya buida
    component.userModel.email = 'test@example.com';
    component.userModel.password = '';
    component.handleSignIn();
    expect(userService.loginUser).not.toHaveBeenCalled();
  });

  it('should handle case when loginUser returns no token', () => {
    spyOn(console, 'error');
    spyOn(window, 'alert');

    component.userModel.email = 'test@example.com';
    component.userModel.password = 'Password123!';

    // Utilitzem casting a any per simular una resposta sense token
    userService.loginUser.and.returnValue(of({} as any));
    component.handleSignIn();

    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle error from refreshCurrentUserData and navigate anyway', () => {
    spyOn(console, 'error');
    spyOn(localStorage, 'setItem');

    component.userModel.email = 'test@example.com';
    component.userModel.password = 'Password123!';

    userService.loginUser.and.returnValue(of({ token: 'testToken123' }));
    userService.refreshCurrentUserData.and.returnValue(throwError(() => new Error('Error')));

    component.handleSignIn();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(console.error).toHaveBeenCalled();
  });
});
