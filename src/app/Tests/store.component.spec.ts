import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreComponent } from '../Components/store/store.component';
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
    // Utilitzem jugadors amb claus que espera Player.fromApi
    const mockPlayers = [
      {
        PlayerID: '11111111-1111-1111-1111-111111111111',
        PlayerName: 'Messi',
        Position: 'Forward',
        TeamID: 'team1',
        IsActive: true,
        IsForSale: false,
        Price: 100,
        Height: 170,
        Speed: 80,
        Shooting: 90,
        PlayerImage: 'img-messi',
        Points: 0,
        TeamName: 'FC Barcelona'
      },
      {
        PlayerID: '22222222-2222-2222-2222-222222222222',
        PlayerName: 'Cristiano',
        Position: 'Forward',
        TeamID: 'team2',
        IsActive: true,
        IsForSale: false,
        Price: 90,
        Height: 180,
        Speed: 85,
        Shooting: 88,
        PlayerImage: 'img-cristiano',
        Points: 0,
        TeamName: 'Juventus'
      }
    ];
    
    component.ngOnInit();
    
    const req = httpMock.expectOne('http://localhost:3000/api/v1/players/store');
    expect(req.request.method).toBe('GET');
    req.flush(mockPlayers);
    
    // Comprovem que el getter retorna els jugadors carregats
    expect(component.storePlayers.length).toBe(2);
    expect(component.storePlayers[0].playerName).toBe('Messi');
  });

  it('should buy a player and update the list', () => {
    // Utilitzem un UUID vàlid per al jugador
    const playerId = '11111111-1111-1111-1111-111111111111';
    const successMessage = { message: 'Jugador comprat amb èxit' };
    spyOn(component, 'fetchStorePlayers');
    
    component.buyPlayer(playerId);
    
    const req = httpMock.expectOne(`http://localhost:3000/api/v1/players/buy/${playerId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userID: component.currentUserUUID });
    req.flush(successMessage);
    
    expect(component.fetchStorePlayers).toHaveBeenCalled();
  });

  it('should show an error if the buy fails', () => {
    const playerId = '11111111-1111-1111-1111-111111111111';
    const errorMessage = { error: 'No tens prou diners' };
    spyOn(window, 'alert');
    
    component.buyPlayer(playerId);
    
    const req = httpMock.expectOne(`http://localhost:3000/api/v1/players/buy/${playerId}`);
    expect(req.request.method).toBe('POST');
    req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    
    expect(window.alert).toHaveBeenCalledWith('No tens prou diners');
  });

  // Proves per als filtres: search, minPrice i maxPrice
  it('should include the search parameter in the GET request when searchTerm is provided', () => {
    component.searchTerm = 'Messi';
    component.fetchStorePlayers();

    const req = httpMock.expectOne(request => {
      return request.url === 'http://localhost:3000/api/v1/players/store' &&
             request.params.has('search') &&
             request.params.get('search') === 'Messi';
    });
    expect(req.request.method).toBe('GET');
    req.flush([]); // Simulem resposta buida
  });

  it('should include the minPrice parameter in the GET request when minPrice is provided', () => {
    component.minPrice = 50;
    component.fetchStorePlayers();

    const req = httpMock.expectOne(request => {
      return request.url === 'http://localhost:3000/api/v1/players/store' &&
             request.params.has('minPrice') &&
             request.params.get('minPrice') === '50';
    });
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should include the maxPrice parameter in the GET request when maxPrice is provided', () => {
    component.maxPrice = 150;
    component.fetchStorePlayers();

    const req = httpMock.expectOne(request => {
      return request.url === 'http://localhost:3000/api/v1/players/store' &&
             request.params.has('maxPrice') &&
             request.params.get('maxPrice') === '150';
    });
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should include all filter parameters (search, minPrice, maxPrice) in the GET request when provided', () => {
    component.searchTerm = 'Leo';
    component.minPrice = 60;
    component.maxPrice = 200;
    component.fetchStorePlayers();

    const req = httpMock.expectOne(request => {
      return request.url === 'http://localhost:3000/api/v1/players/store' &&
             request.params.has('search') &&
             request.params.get('search') === 'Leo' &&
             request.params.has('minPrice') &&
             request.params.get('minPrice') === '60' &&
             request.params.has('maxPrice') &&
             request.params.get('maxPrice') === '200';
    });
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call applyFilters and trigger a new API call', () => {
    spyOn(component, 'fetchStorePlayers');
    component.applyFilters();
    expect(component.fetchStorePlayers).toHaveBeenCalled();
  });
});
