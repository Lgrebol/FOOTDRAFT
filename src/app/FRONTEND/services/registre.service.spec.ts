import { TestBed } from '@angular/core/testing';
import { RegistreService } from './registre.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('RegistreService', () => {
  let service: RegistreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegistreService]
    });

    service = TestBed.inject(RegistreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST request to register a user', () => {
    const mockResponse = { success: true };
    const userData = { username: 'TestUser', email: 'test@example.com', password: 'Password123!' };
  
    service.register(userData.username, userData.email, userData.password).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne('http://localhost:3000/api/v1/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: userData.username, email: userData.email, password: userData.password });
  
    req.flush(mockResponse);
  });

  it('should send a POST request to validate a user', () => {
    const mockResponse = { token: 'testToken123' };
    const loginData = { email: 'test@example.com', password: 'Password123!' };
  
    service.validateUser(loginData.email, loginData.password).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne('http://localhost:3000/api/v1/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);
  
    req.flush(mockResponse);
  });
  
  it('should save token to localStorage', () => {
    service.saveToken('testToken123');
    expect(localStorage.getItem('authToken')).toBe('testToken123');
  });
  
});
