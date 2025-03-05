import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { MainLayoutComponent } from '../Components/main-layout/main-layout.component';
import { UserService } from '../Serveis/user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { User } from '../Classes/user/user.model';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let router: Router;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', [
      'getFootcoinsUpdates',
      'refreshCurrentUserData',
      'updateFootcoins',
      'logoutUser'
    ]);

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent, RouterTestingModule],
      providers: [{ provide: UserService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    userServiceSpy.getFootcoinsUpdates.and.returnValue(of(0));
    // Creem una instància de User i assignem els valors manualment
    const mockUser = new User();
    mockUser.userUUID = '123';
    mockUser.username = 'TestUser';
    mockUser.email = 'test@example.com';
    mockUser.footcoins = 0;
    userServiceSpy.refreshCurrentUserData.and.returnValue(of(mockUser));
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should subscribe to footcoins updates and update footcoins value', () => {
    const footcoinsSubject = new Subject<number>();
    userServiceSpy.getFootcoinsUpdates.and.returnValue(footcoinsSubject.asObservable());
    const mockUser = new User();
    mockUser.userUUID = '123';
    mockUser.username = 'TestUser';
    mockUser.email = 'test@example.com';
    mockUser.footcoins = 0;
    userServiceSpy.refreshCurrentUserData.and.returnValue(of(mockUser));

    component.ngOnInit();
    expect(component.footcoins).toBe(0);

    footcoinsSubject.next(100);
    expect(component.footcoins).toBe(100);
    footcoinsSubject.next(200);
    expect(component.footcoins).toBe(200);
  });

  it('should call refreshCurrentUserData on initialization and update footcoins', () => {
    userServiceSpy.getFootcoinsUpdates.and.returnValue(of(0));
    const mockUser = new User();
    mockUser.userUUID = '123';
    mockUser.username = 'TestUser';
    mockUser.email = 'test@example.com';
    mockUser.footcoins = 50;
    userServiceSpy.refreshCurrentUserData.and.returnValue(of(mockUser));

    component.ngOnInit();

    expect(userServiceSpy.refreshCurrentUserData).toHaveBeenCalled();
    expect(userServiceSpy.updateFootcoins).toHaveBeenCalledWith(50);
  });

  it('should log error if getFootcoinsUpdates fails', () => {
    const testError = new Error('Footcoins update error');
    spyOn(console, 'error');
  
    userServiceSpy.getFootcoinsUpdates.and.returnValue(throwError(() => testError));
    const mockUser = new User();
    mockUser.userUUID = '123';
    mockUser.username = 'TestUser';
    mockUser.email = 'test@example.com';
    mockUser.footcoins = 0;
    userServiceSpy.refreshCurrentUserData.and.returnValue(of(mockUser));
  
    component.ngOnInit();
  
    expect(console.error).toHaveBeenCalledWith('Error updating footcoins:', testError);
  });

  it('should redirect to /login if refreshCurrentUserData fails', () => {
    const testError = new Error('Refresh error');
    const routerNavigateSpy = spyOn(router, 'navigate');

    userServiceSpy.getFootcoinsUpdates.and.returnValue(of(0));
    userServiceSpy.refreshCurrentUserData.and.returnValue(throwError(() => testError));

    component.ngOnInit();

    expect(routerNavigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should call logoutUser and navigate to /login on logout', () => {
    const routerNavigateSpy = spyOn(router, 'navigate');
    userServiceSpy.logoutUser.and.stub();

    component.logout();

    expect(userServiceSpy.logoutUser).toHaveBeenCalled();
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
