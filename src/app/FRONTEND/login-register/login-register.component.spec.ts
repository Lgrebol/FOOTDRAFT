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

  it('should call register when form is valid', () => {
    component.username = 'TestUser';
    component.email = 'test@example.com';
    component.password = 'Password123!';
    component.confirmPassword = 'Password123!';
    
    registreService.register.and.returnValue(of({ success: true }));
    
    component.onSubmit();
    
    expect(registreService.register).toHaveBeenCalledWith('TestUser', 'test@example.com', 'Password123!');
  });
  
});
