import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RegistreService } from '../services/registre.service';
import { LoginRegisterComponent } from './login-register.component';

describe('LoginRegisterComponent', () => {
  let component: LoginRegisterComponent;
  let fixture: ComponentFixture<LoginRegisterComponent>;
  let registreService: jasmine.SpyObj<RegistreService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const registreServiceSpy = jasmine.createSpyObj('RegistreService', ['register', 'validateUser', 'saveToken']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginRegisterComponent],
      imports: [FormsModule],
      providers: [
        { provide: RegistreService, useValue: registreServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginRegisterComponent);
    component = fixture.componentInstance;
    registreService = TestBed.inject(RegistreService) as jasmine.SpyObj<RegistreService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
});
