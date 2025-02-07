import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { MainLayoutComponent } from './main-layout.component';
import { UserService } from '../services/users.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    // Creem un spy per UserService amb els mètodes utilitzats
    const spy = jasmine.createSpyObj('UserService', ['getFootcoinsUpdates', 'refreshUserData']);

    await TestBed.configureTestingModule({
      // Afegim RouterTestingModule per proveir ActivatedRoute i altres dependències del router
      imports: [MainLayoutComponent, RouterTestingModule],
      providers: [{ provide: UserService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create', () => {
    userServiceSpy.getFootcoinsUpdates.and.returnValue(of(0));
    userServiceSpy.refreshUserData.and.returnValue(of({}));
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should subscribe to footcoins updates and update footcoins value', () => {
    const footcoinsSubject = new Subject<number>();
    userServiceSpy.getFootcoinsUpdates.and.returnValue(footcoinsSubject.asObservable());
    userServiceSpy.refreshUserData.and.returnValue(of({}));
  
    component.ngOnInit();
  
    // Inicialment, footcoins ha de ser 0
    expect(component.footcoins).toBe(0);
  
    // Enviem actualitzacions i comprovem que la propietat s'actualitza
    footcoinsSubject.next(100);
    expect(component.footcoins).toBe(100);
    footcoinsSubject.next(200);
    expect(component.footcoins).toBe(200);
  });

  it('should call refreshUserData on initialization', () => {
    userServiceSpy.getFootcoinsUpdates.and.returnValue(of(0));
    userServiceSpy.refreshUserData.and.returnValue(of({}));
  
    component.ngOnInit();
  
    expect(userServiceSpy.refreshUserData).toHaveBeenCalled();
  });

  it('should log error if getFootcoinsUpdates fails', () => {
    const testError = new Error('Footcoins update error');
    spyOn(console, 'error');
  
    userServiceSpy.getFootcoinsUpdates.and.returnValue(throwError(() => testError));
    userServiceSpy.refreshUserData.and.returnValue(of({}));
  
    component.ngOnInit();
  
    expect(console.error).toHaveBeenCalledWith('Error obtenint footcoins:', testError);
  });  

  it('should log error if refreshUserData fails', () => {
    const testError = new Error('Refresh error');
    spyOn(console, 'error');
  
    userServiceSpy.getFootcoinsUpdates.and.returnValue(of(0));
    userServiceSpy.refreshUserData.and.returnValue(throwError(() => testError));
  
    component.ngOnInit();
  
    expect(console.error).toHaveBeenCalledWith('Error carregant dades inicials:', testError);
  });
});
