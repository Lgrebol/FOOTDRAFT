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
        HttpClientTestingModule, // Per mocking de HTTP
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
    it('hauria d’afegir un jugador correctament', () => {
      const mockPlayers = [
        { id: 1, name: 'Player 1', position: 'Defender', team: 'Team A' },
        { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' },
      ];

      spyOn(component, 'fetchPlayers').and.callFake(() => {
        component.players = mockPlayers;
      });

      component.newPlayer = { name: 'New Player', position: 'Midfielder', team: 'Team C' };

      component.addPlayer();

      const reqPost = httpMock.expectOne('http://localhost:3000/api/v1/players');
      expect(reqPost.request.method).toBe('POST');
      expect(reqPost.request.body).toEqual({
        playerName: 'New Player',
        position: 'Midfielder',
        teamID: 'Team C',
      });

      reqPost.flush({});
      expect(component.newPlayer).toEqual({ name: '', position: '', team: '' });
    });

    it('no hauria d’afegir un jugador si falten dades', () => {
      component.newPlayer = { name: '', position: '', team: '' };

      component.addPlayer();

      httpMock.expectNone('http://localhost:3000/api/v1/players');
    });

    it('hauria de mostrar un error si addPlayer falla', () => {
      spyOn(console, 'error');
      component.newPlayer = { name: 'New Player', position: 'Midfielder', team: 'Team C' };

      component.addPlayer();

      const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

      expect(console.error).toHaveBeenCalledWith('Error afegint el jugador:', jasmine.anything());
    });
  });

  describe('deletePlayer', () => {
    it('hauria d’eliminar un jugador correctament', () => {
      const mockPlayers = [
        { id: 1, name: 'Player 1', position: 'Defender', team: 'Team A' },
        { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' },
      ];

      spyOn(component, 'fetchPlayers').and.callFake(() => {
        component.players = mockPlayers;
      });

      component.ngOnInit();
      component.fetchPlayers();
      const fetchReq = httpMock.expectOne('http://localhost:3000/api/v1/players');
      fetchReq.flush(mockPlayers);

      const playerId = 1;
      component.deletePlayer(playerId);

      const deleteReq = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      expect(component.players).toEqual([
        { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' }
      ]);

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
    it('should load the teams correclty with fetchTeams', () => {
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
  }); 

  afterEach(() => {
    httpMock.verify();
  });
});
