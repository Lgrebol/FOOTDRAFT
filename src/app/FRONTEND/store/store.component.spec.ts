import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreComponent } from './store.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('StoreComponent', () => {
  let component: StoreComponent;
  let fixture: ComponentFixture<StoreComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StoreComponent],
    }).compileComponents();
  
    fixture = TestBed.createComponent(StoreComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the players in the store once is inicialitzated', () => {
    const mockPlayers = [
      { id: 1, name: 'Messi', position: 'Forward', price: 100 },
      { id: 2, name: 'Cristiano', position: 'Forward', price: 90 }
    ];
    
    component.ngOnInit();
    
    const req = httpMock.expectOne('http://localhost:3000/api/v1/players/store');
    expect(req.request.method).toBe('GET');
    req.flush(mockPlayers);
    
    expect(component.storePlayers).toEqual(mockPlayers);
  });

});
