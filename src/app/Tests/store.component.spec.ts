import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreComponent } from '../Components/store/store.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

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

    // Flush the initial GET request triggered by the StoreService constructor.
    const initialReq = httpMock.expectOne('http://localhost:3000/api/v1/players/store');
    expect(initialReq.request.method).toBe('GET');
    initialReq.flush([]);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the players in the store once is inicialitzated', () => {
    // Use valid UUIDs in the mock players.
    const mockPlayers = [
      {
        PlayerID: '11111111-1111-4111-8111-111111111111',
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
        PlayerID: '22222222-2222-4222-9222-222222222222',
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
    
    // Trigger a new fetch (this could be triggered by ngOnInit or manually).
    component.fetchStorePlayers();
    const req = httpMock.expectOne('http://localhost:3000/api/v1/players/store');
    expect(req.request.method).toBe('GET');
    req.flush(mockPlayers);
    
    // Verify that the component’s getter returns the loaded players.
    expect(component.storePlayers.length).toBe(2);
    expect(component.storePlayers[0].playerName).toBe('Messi');
  });

  it('should buy a player and update the list', () => {
    // Use a valid UUID for the player.
    const playerId = '11111111-1111-4111-8111-111111111111';
    const successMessage = { message: 'Jugador comprat amb èxit' };

    component.buyPlayer(playerId);
    
    // Expect the POST request to buy the player.
    const postReq = httpMock.expectOne(`http://localhost:3000/api/v1/players/buy/${playerId}`);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ userID: component.currentUserUUID });
    postReq.flush(successMessage);

    // Because of the tap in the service, a GET request is triggered to refresh the list.
    const getReq = httpMock.expectOne('http://localhost:3000/api/v1/players/store');
    expect(getReq.request.method).toBe('GET');
    getReq.flush([]);

    expect(component.storeModel.success).toBe('Jugador comprat correctament!');
  });

  it('should show an error if the buy fails', () => {
    // Use a valid UUID for the player.
    const playerId = '11111111-1111-4111-8111-111111111111';
    const errorMessage = { error: 'No tens prou diners' };

    component.buyPlayer(playerId);
    
    const postReq = httpMock.expectOne(`http://localhost:3000/api/v1/players/buy/${playerId}`);
    expect(postReq.request.method).toBe('POST');
    postReq.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    
    expect(component.storeModel.error).toBe('No tens prou diners');
  });

  it('should include the search parameter in the GET request when searchTerm is provided', () => {
    component.searchTerm = 'Messi';
    component.fetchStorePlayers();

    const req = httpMock.expectOne(request => {
      return request.url === 'http://localhost:3000/api/v1/players/store' &&
             request.params.has('search') &&
             request.params.get('search') === 'Messi';
    });
    expect(req.request.method).toBe('GET');
    req.flush([]); // Simulate an empty response.
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
