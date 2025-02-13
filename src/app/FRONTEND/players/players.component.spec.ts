import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlayersComponent } from './players.component';

describe('PlayersComponent', () => {
  let component: PlayersComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlayersComponent, // Component standalone
        HttpClientTestingModule, // For mocking HTTP
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PlayersComponent);
    component = fixture.componentInstance;
  });

  describe('fetchPlayers', () => {
    it('hauria de carregar els jugadors correctament', () => {
      const mockPlayers = [
        { id: 1, name: 'Player 1', position: 'Defender', team: 'Team A' },
        { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' },
      ];

      component.fetchPlayers();

      const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
      expect(req.request.method).toBe('GET');
      req.flush(mockPlayers);

      expect(component.players).toEqual(mockPlayers);
    });

    it('hauria de mostrar un error si fetchPlayers falla', () => {
      spyOn(console, 'error');
      component.fetchPlayers();

      const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

      expect(console.error).toHaveBeenCalledWith('Error carregant els jugadors:', jasmine.anything());
    });
  });

  describe('addPlayer', () => {
    it('should add new player correctly', () => {
      const mockPlayers = [
        { id: 1, name: 'Player 1', position: 'Defender', team: 'Team A' },
        { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' },
      ];
    
      spyOn(component, 'fetchPlayers').and.callFake(() => {
        component.players = mockPlayers;
      });
    
      // Set valid player data
      component.newPlayer = { name: 'New Player', position: 'Midfielder', team: 'Team C' };
      // Simulate file selection
      component.selectedFile = new File(['dummy content'], 'dummy.png', { type: 'image/png' });
    
      component.addPlayer();
    
      const reqPost = httpMock.expectOne('http://localhost:3000/api/v1/players');
      expect(reqPost.request.method).toBe('POST');
      // Note: The body is a FormData, so you might need to extract its entries for comparison.
      // For this example, we'll assume the test environment handles it.
      reqPost.flush({});
      expect(component.newPlayer).toEqual({ name: '', position: '', team: '' });
    });
    

    it('no hauria d’afegir un jugador si falten dades', () => {
      component.newPlayer = { name: '', position: '', team: '' };

      component.addPlayer();

      httpMock.expectNone('http://localhost:3000/api/v1/players');
    });

    it('should show an error if addPlayer fails', () => {
      spyOn(console, 'error');
      component.newPlayer = { name: 'New Player', position: 'Midfielder', team: 'Team C' };
      component.selectedFile = new File(['dummy content'], 'dummy.png', { type: 'image/png' });
      
      component.addPlayer();
    
      const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
    
      expect(console.error).toHaveBeenCalledWith('Error afegint el jugador:', jasmine.anything());
    });
    
    it('shouldn’t add new player if no teams are available', () => {
      component.teams = []; // Simulate that no teams are available
      component.newPlayer = {
        name: 'New Player',
        position: 'Midfielder',
        team: '1',
      };

      // Spy on HTTP calls to ensure no request is made
      const httpSpy = spyOn(component['http'], 'post').and.callThrough();

      component.addPlayer();

      // Verify that no HTTP request was made to add the player
      expect(httpSpy).not.toHaveBeenCalled();

      // Ensure no request to the players' endpoint was made
      httpMock.expectNone('http://localhost:3000/api/v1/players');
    });
  });

  describe('deletePlayer', () => {
    it('hauria d’eliminar un jugador correctament', () => {
  const mockPlayers = [
    { id: 1, name: 'Player 1', position: 'Defender', team: 'Team A' },
    { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' },
  ];
  const mockTeams = [
    { TeamID: 1, TeamName: 'Team A' },
    { TeamID: 2, TeamName: 'Team B' },
  ];

  // Trigger ngOnInit to call fetchPlayers and fetchTeams
  component.ngOnInit();

  // Mock initial GET requests for players and teams
  const playersReq = httpMock.expectOne('http://localhost:3000/api/v1/players');
  playersReq.flush(mockPlayers);
  const teamsReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
  teamsReq.flush(mockTeams);

  // Verify initial data setup
  expect(component.players).toEqual(mockPlayers);
  expect(component.teams).toEqual(mockTeams);

  // Call deletePlayer
  const playerId = 1;
  component.deletePlayer(playerId);

  // Expect DELETE request and flush it
  const deleteReq = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
  expect(deleteReq.request.method).toBe('DELETE');
  deleteReq.flush({});

  // Mock the subsequent GET request from fetchPlayers called after deletion
  const fetchAfterDeleteReq = httpMock.expectOne('http://localhost:3000/api/v1/players');
  fetchAfterDeleteReq.flush(mockPlayers.filter(p => p.id !== playerId));

  // Verify the players list is updated
  expect(component.players).toEqual([{ id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' }]);

  httpMock.verify();
});
    it('hauria de mostrar un error si deletePlayer falla', () => {
      spyOn(console, 'error');

      const playerId = 1;
      component.deletePlayer(playerId);

      const req = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

      expect(console.error).toHaveBeenCalledWith('Error eliminant el jugador:', jasmine.anything());
    });
  });

  describe('fetchTeams', () => {
    it('should load the teams correctly with fetchTeams', () => {
      const mockTeams = [
        { TeamID: 1, TeamName: 'Team A' },
        { TeamID: 2, TeamName: 'Team B' },
      ];

      component.fetchTeams();
      const req = httpMock.expectOne('http://localhost:3000/api/v1/teams');
      expect(req.request.method).toBe('GET');

      req.flush(mockTeams);

      expect(component.teams).toEqual(mockTeams);
    });

    it('should show an error if fetchTeams bug', () => {
      spyOn(console, 'error');
  
      component.fetchTeams();
  
      const req = httpMock.expectOne('http://localhost:3000/api/v1/teams');
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
  
      expect(console.error).toHaveBeenCalledWith('Error carregant els equips:', jasmine.anything());
    });

    it('should load the players during ngOnInit', () => {
      spyOn(component, 'fetchPlayers');
      spyOn(component, 'fetchTeams');
    
      component.ngOnInit();
    
      expect(component.fetchPlayers).toHaveBeenCalled();
      expect(component.fetchTeams).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
