import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlayersComponent } from '../Components/players/players.component';
import { Team } from '../Classes/teams/team.model';

// Funció auxiliar per crear una instància de Team
const createMockTeam = (
  teamUUID: string,
  teamName: string,
  shirtColor: string,
  userUUID: string,
  username: string
): Team => new Team(teamUUID, teamName, shirtColor, userUUID, username);

describe('PlayersComponent', () => {
  let component: PlayersComponent;
  let fixture: ComponentFixture<PlayersComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayersComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('loadData', () => {
    it('hauria de carregar els jugadors i equips correctament', () => {
      const mockPlayers = [
        {
          PlayerID: '1',
          PlayerName: 'Player 1',
          Position: 'Defender',
          TeamID: 'teamA',
          IsActive: true,
          IsForSale: false,
          Price: 10,
          Height: 180,
          Speed: 80,
          Shooting: 75,
          PlayerImage: 'image1',
          Points: 5,
          TeamName: 'Team A'
        },
        {
          PlayerID: '2',
          PlayerName: 'Player 2',
          Position: 'Forward',
          TeamID: 'teamB',
          IsActive: true,
          IsForSale: false,
          Price: 20,
          Height: 175,
          Speed: 85,
          Shooting: 90,
          PlayerImage: 'image2',
          Points: 10,
          TeamName: 'Team B'
        }
      ];

      const mockTeams = [
        createMockTeam('teamA', 'Team A', 'red', 'u1', 'User1'),
        createMockTeam('teamB', 'Team B', 'blue', 'u2', 'User2')
      ];

      component.loadData();
      const reqPlayers = httpMock.expectOne('http://localhost:3000/api/v1/players');
      expect(reqPlayers.request.method).toBe('GET');
      reqPlayers.flush(mockPlayers);

      const reqTeams = httpMock.expectOne('http://localhost:3000/api/v1/teams');
      expect(reqTeams.request.method).toBe('GET');
      reqTeams.flush(mockTeams);

      expect(component.players.length).toBe(2);
      expect(component.teams.length).toBe(2);
    });

    it('hauria de mostrar un error si loadData falla per jugadors', () => {
      spyOn(console, 'error');
      component.loadData();
      const reqPlayers = httpMock.expectOne('http://localhost:3000/api/v1/players');
      reqPlayers.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
      expect(console.error).toHaveBeenCalled();
      const reqTeams = httpMock.expectOne('http://localhost:3000/api/v1/teams');
      reqTeams.flush([]);
    });
  });

  describe('addPlayer', () => {
    it('should add new player correctly', () => {
      const mockTeams = [
        createMockTeam('teamC', 'Team C', 'green', 'u3', 'User3')
      ];
      component.teams = mockTeams;
      
      spyOn(component, 'loadData');

      component.newPlayer.playerName = 'New Player';
      component.newPlayer.position = 'Midfielder';
      component.newPlayer.teamUUID = 'teamC';
      component.newPlayer.isActive = true;
      component.newPlayer.isForSale = false;
      component.newPlayer.price = 0;
      component.newPlayer.height = 0;
      component.newPlayer.speed = 0;
      component.newPlayer.shooting = 0;
      component.newPlayer.imageFile = new File(['dummy content'], 'dummy.png', { type: 'image/png' });

      component.addPlayer();

      const reqPost = httpMock.expectOne('http://localhost:3000/api/v1/players');
      expect(reqPost.request.method).toBe('POST');
      reqPost.flush({
        PlayerID: '3',
        PlayerName: 'New Player',
        Position: 'Midfielder',
        TeamID: 'teamC',
        IsActive: true,
        IsForSale: false,
        Price: 0,
        Height: 0,
        Speed: 0,
        Shooting: 0,
        PlayerImage: 'dummyImage',
        Points: 0,
        TeamName: 'Team C'
      });

      expect(component.loadData).toHaveBeenCalled();
      expect(component.newPlayer.playerName).toEqual('');
      expect(component.newPlayer.position).toEqual('');
      expect(component.newPlayer.teamUUID).toEqual('');
      expect(component.newPlayer.price).toEqual(0);
      expect(component.newPlayer.height).toEqual(0);
      expect(component.newPlayer.speed).toEqual(0);
      expect(component.newPlayer.shooting).toEqual(0);
      expect(component.newPlayer.imageFile).toBeUndefined();
    });

    it('no hauria d’afegir un jugador si falten dades', () => {
      const mockTeams = [
        createMockTeam('teamA', 'Team A', 'red', 'u1', 'User1')
      ];
      component.teams = mockTeams;
      
      component.newPlayer.playerName = '';
      component.newPlayer.position = '';
      component.newPlayer.teamUUID = '';
      component.newPlayer.isActive = true;
      component.newPlayer.isForSale = false;
      component.newPlayer.price = 0;
      component.newPlayer.height = 0;
      component.newPlayer.speed = 0;
      component.newPlayer.shooting = 0;
      component.newPlayer.imageFile = undefined;
      
      spyOn(window, 'alert');
      component.addPlayer();
      
      httpMock.expectNone('http://localhost:3000/api/v1/players');
      expect(window.alert).toHaveBeenCalledWith('Si us plau, omple tots els camps obligatoris.');
    });

    it('should show an error if addPlayer fails', () => {
      const mockTeams = [
        createMockTeam('teamC', 'Team C', 'green', 'u3', 'User3')
      ];
      component.teams = mockTeams;
      
      spyOn(console, 'error');

      component.newPlayer.playerName = 'New Player';
      component.newPlayer.position = 'Midfielder';
      component.newPlayer.teamUUID = 'teamC';
      component.newPlayer.isActive = true;
      component.newPlayer.isForSale = false;
      component.newPlayer.price = 0;
      component.newPlayer.height = 0;
      component.newPlayer.speed = 0;
      component.newPlayer.shooting = 0;
      component.newPlayer.imageFile = new File(['dummy content'], 'dummy.png', { type: 'image/png' });

      component.addPlayer();

      const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

      expect(console.error).toHaveBeenCalled();
    });

    it('shouldn’t add new player if no teams are available', () => {
      component.teams = [];
      
      component.newPlayer.playerName = 'New Player';
      component.newPlayer.position = 'Midfielder';
      component.newPlayer.teamUUID = 'team1';
      component.newPlayer.isActive = true;
      component.newPlayer.isForSale = false;
      component.newPlayer.price = 0;
      component.newPlayer.height = 0;
      component.newPlayer.speed = 0;
      component.newPlayer.shooting = 0;
      component.newPlayer.imageFile = new File(['dummy content'], 'dummy.png', { type: 'image/png' });
      
      const httpSpy = spyOn(component['playerService']['http'], 'post').and.callThrough();
      spyOn(window, 'alert');

      component.addPlayer();

      expect(httpSpy).not.toHaveBeenCalled();
      httpMock.expectNone('http://localhost:3000/api/v1/players');
    });
  });

  describe('deletePlayer', () => {
    it('hauria d’eliminar un jugador correctament', () => {
      const mockPlayers = [
        {
          PlayerID: '1',
          PlayerName: 'Player 1',
          Position: 'Defender',
          TeamID: 'teamA',
          IsActive: true,
          IsForSale: false,
          Price: 10,
          Height: 180,
          Speed: 80,
          Shooting: 75,
          PlayerImage: 'image1',
          Points: 5,
          TeamName: 'Team A'
        },
        {
          PlayerID: '2',
          PlayerName: 'Player 2',
          Position: 'Forward',
          TeamID: 'teamB',
          IsActive: true,
          IsForSale: false,
          Price: 20,
          Height: 175,
          Speed: 85,
          Shooting: 90,
          PlayerImage: 'image2',
          Points: 10,
          TeamName: 'Team B'
        }
      ];
      const mockTeams = [
        createMockTeam('teamA', 'Team A', 'red', 'u1', 'User1'),
        createMockTeam('teamB', 'Team B', 'blue', 'u2', 'User2')
      ];

      component.ngOnInit();
      const reqPlayers = httpMock.expectOne('http://localhost:3000/api/v1/players');
      reqPlayers.flush(mockPlayers);
      const reqTeams = httpMock.expectOne('http://localhost:3000/api/v1/teams');
      reqTeams.flush(mockTeams);

      expect(component.players.length).toBe(2);
      expect(component.teams.length).toBe(2);

      spyOn(component, 'loadData');
      const playerId = '1';
      component.deletePlayer(playerId);

      const deleteReq = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      expect(component.loadData).toHaveBeenCalled();
    });

    it('hauria de mostrar un error si deletePlayer falla', () => {
      spyOn(console, 'error');
      const playerId = '1';
      component.deletePlayer(playerId);

      const req = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

      expect(console.error).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
