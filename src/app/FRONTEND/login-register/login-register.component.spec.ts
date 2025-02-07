import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ElementRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RegistreService } from '../services/registre.service';
import { UserService } from '../services/users.service';
import { LoginRegisterComponent } from './login-register.component';

describe('LoginRegisterComponent', () => {
  let component: LoginRegisterComponent;
  let fixture: ComponentFixture<LoginRegisterComponent>;
  let registreService: jasmine.SpyObj<RegistreService>;
  let router: jasmine.SpyObj<Router>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    // Creem spies per als serveis
    const registreServiceSpy = jasmine.createSpyObj('RegistreService', ['register', 'validateUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['refreshUserData']);

    await TestBed.configureTestingModule({
      imports: [LoginRegisterComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: RegistreService, useValue: registreServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginRegisterComponent);
    component = fixture.componentInstance;
    registreService = TestBed.inject(RegistreService) as jasmine.SpyObj<RegistreService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call register when form is valid', () => {
    component.username = 'TestUser';
    component.email = 'test@example.com';
    component.password = 'Password123!';
    component.confirmPassword = 'Password123!';

    registreService.register.and.returnValue(of({ success: true }));

    component.onSubmit();

    expect(registreService.register).toHaveBeenCalledWith('TestUser', 'test@example.com', 'Password123!');
  });

  it('should set error flags when form is invalid', () => {
    component.username = '';
    component.email = '';
    component.password = '';
    component.confirmPassword = '';

    component.onSubmit();

    expect(component.usernameError).toBeTrue();
    expect(component.emailError).toBeTrue();
    expect(component.passwordError).toBeTrue();
  });

  it('should return true if passwords match', () => {
    component.password = 'Password123!';
    component.confirmPassword = 'Password123!';
    expect(component.passwordMatchValidator()).toBeTrue();
  });

  it('should return false if passwords do not match', () => {
    component.password = 'Password123!';
    component.confirmPassword = 'WrongPassword!';
    expect(component.passwordMatchValidator()).toBeFalse();
  });

  it('should return true for valid passwords', () => {
    component.password = 'Password123!';
    expect(component.passwordValidator()).toBeTrue();
  });

  it('should return false for short passwords', () => {
    component.password = 'Pass!';
    expect(component.passwordValidator()).toBeFalse();
  });

  it('should return false for passwords without special characters', () => {
    component.password = 'Password123';
    expect(component.passwordValidator()).toBeFalse();
  });

  it('should clear input fields', () => {
    component.username = 'TestUser';
    component.email = 'test@example.com';
    component.password = 'Password123!';
    component.confirmPassword = 'Password123!';

    component.clearInputs();

    expect(component.username).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.confirmPassword).toBe('');
  });

  it('should toggle sign-up-mode class on container when clicking sign-up and sign-in buttons', () => {
    // Creem elements DOM simulats
    const containerDiv = document.createElement('div');
    const signUpBtn = document.createElement('button');
    const signInBtn = document.createElement('button');

    // Assignem els elements al component
    component.container = new ElementRef(containerDiv);
    component.signUpBtn = new ElementRef(signUpBtn);
    component.signInBtn = new ElementRef(signInBtn);

    // Invoquem ngAfterViewInit per establir els event listeners
    component.ngAfterViewInit();

    // Simulem clic en el botó de sign-up: ha d'afegir la classe 'sign-up-mode'
    signUpBtn.click();
    expect(containerDiv.classList.contains('sign-up-mode')).toBeTrue();

    // Simulem clic en el botó de sign-in: la classe 'sign-up-mode' s'ha de treure
    containerDiv.classList.add('sign-up-mode');
    signInBtn.click();
    expect(containerDiv.classList.contains('sign-up-mode')).toBeFalse();
  });

  it('should call validateUser, set token, refresh user data and navigate on successful login', () => {
    component.email = 'test@example.com';
    component.password = 'Password123!';
  
    // Simulem que refreshUserData retorna un Observable que s'executa immediatament
    userService.refreshUserData.and.returnValue(of({}));
  
    // Espionem la crida a localStorage.setItem
    spyOn(localStorage, 'setItem');
  
    registreService.validateUser.and.returnValue(of({ token: 'testToken123' }));
  
    component.handleSignIn();
  
    expect(registreService.validateUser).toHaveBeenCalledWith('test@example.com', 'Password123!');
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'testToken123');
    expect(userService.refreshUserData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
  

});
