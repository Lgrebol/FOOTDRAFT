import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayersComponent } from '../Components/players/players.component';
import { PlayerService } from '../Serveis/player.service';
import { TeamService } from '../Serveis/team.service';
import { Player } from '../Classes/players/player.model';
import { Team } from '../Classes/teams/team.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

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
      imports: [CommonModule, FormsModule, HttpClientTestingModule],
      providers: [PlayerService, TeamService]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayersComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('ngOnInit', () => {
    it('should load the players correctly', () => {
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
    
      // Forcem una nova càrrega (ngOnInit)
      component.ngOnInit();
    
      // Recuperem totes les peticions GET per als jugadors i les flusham
      const reqPlayers = httpMock.match('http://localhost:3000/api/v1/players');
      expect(reqPlayers.length).toBeGreaterThanOrEqual(1);
      reqPlayers.forEach(req => {
        expect(req.request.method).toBe('GET');
        req.flush(mockPlayers);
      });
    
      // Recuperem totes les peticions GET per als equips i les flusham
      const reqTeams = httpMock.match('http://localhost:3000/api/v1/teams');
      expect(reqTeams.length).toBeGreaterThanOrEqual(1);
      reqTeams.forEach(req => {
        expect(req.request.method).toBe('GET');
        req.flush(mockTeams);
      });
    
      expect(component.players.length).toBe(2);
      expect(component.teams.length).toBe(2);
    });
  });   
   

  describe('addPlayer', () => {
    beforeEach(() => {
      const getPlayers = httpMock.match(
        req => req.method === 'GET' && req.url === 'http://localhost:3000/api/v1/players'
      );
      getPlayers.forEach(req => req.flush([]));
  
      const getTeams = httpMock.match(
        req => req.method === 'GET' && req.url === 'http://localhost:3000/api/v1/teams'
      );
      getTeams.forEach(req => req.flush([]));
    });
  
    it('should add new player correctly', () => {
      // Configurem equips per tal que la validació passi
      const mockTeams = [createMockTeam('teamC', 'Team C', 'green', 'u3', 'User3')];
      component.teams = mockTeams;
  
      // Assignem dades vàlides al newPlayer
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
  
      // Comprovem que es fa la petició POST
      const reqPost = httpMock.expectOne(
        req => req.method === 'POST' && req.url === 'http://localhost:3000/api/v1/players'
      );
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
  
      // Després de crear, s'afegeix el jugador i es reinicialitza newPlayer
      expect(component.players.length).toBe(1);
      expect(component.players[0].playerName).toBe('New Player');
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
      const mockTeams = [createMockTeam('teamA', 'Team A', 'red', 'u1', 'User1')];
      component.teams = mockTeams;

      // Dades invàlides
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
      const mockTeams = [createMockTeam('teamC', 'Team C', 'green', 'u3', 'User3')];
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
      
      // Si no hi ha equips, la validació ha de bloquejar l'addició
      const httpSpy = spyOn(TestBed.inject(PlayerService)['http'], 'post').and.callThrough();
      spyOn(window, 'alert');

      component.addPlayer();

      expect(httpSpy).not.toHaveBeenCalled();
      httpMock.expectNone('http://localhost:3000/api/v1/players');
    });
  });

  describe('deletePlayer', () => {
    it('should delete correctly a player', () => {
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
    
      // Simulem la càrrega inicial
      component.ngOnInit();
    
      // Recuperem i flusham totes les peticions GET per als jugadors
      const reqPlayers = httpMock.match('http://localhost:3000/api/v1/players');
      reqPlayers.forEach(req => {
        expect(req.request.method).toBe('GET');
        req.flush(mockPlayers);
      });
    
      // Recuperem i flusham totes les peticions GET per als equips
      const reqTeams = httpMock.match('http://localhost:3000/api/v1/teams');
      reqTeams.forEach(req => {
        expect(req.request.method).toBe('GET');
        req.flush(mockTeams);
      });
    
      expect(component.players.length).toBe(2);
      expect(component.teams.length).toBe(2);
    
      const playerId = '1';
      component.deletePlayer(playerId);
    
      const deleteReq = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});
    
      // Comprovem que el jugador amb id '1' ja no existeix
      expect(component.players.find(p => p.playerUUID === playerId)).toBeUndefined();
    });
    

    it('should show an error if deletePlayer fails', () => {
      spyOn(console, 'error');
    
      // Flush les peticions GET pendents (de ngOnInit)
      const reqPlayers = httpMock.match('http://localhost:3000/api/v1/players');
      reqPlayers.forEach(req => req.flush([]));
    
      const reqTeams = httpMock.match('http://localhost:3000/api/v1/teams');
      reqTeams.forEach(req => req.flush([]));
    
      const playerId = '1';
      component.deletePlayer(playerId);
    
      const req = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
    
      expect(console.error).toHaveBeenCalled();
    });    
  });

  describe('Editing Players', () => {
    let mockPlayer: Player;
  
    beforeEach(() => {
      // Flush any pending GET requests triggered by ngOnInit
      const reqPlayers = httpMock.match('http://localhost:3000/api/v1/players');
      reqPlayers.forEach(req => req.flush([]));
      const reqTeams = httpMock.match('http://localhost:3000/api/v1/teams');
      reqTeams.forEach(req => req.flush([]));
  
      // Create a valid player
      mockPlayer = new Player(
        '1',
        'Original Player',
        'Defender',
        'teamA',
        true,
        false,
        100,
        180,
        80,
        75,
        'image.jpg'
      );
      component.players = [mockPlayer];
      component.teams = [createMockTeam('teamA', 'Team A', 'blue', 'user1', 'User 1')];
    });
  
    it('should clone the player correctly for editing', () => {
      component.editPlayer(mockPlayer);
      expect(component.editingPlayer).toBeTruthy();
      expect(component.editingPlayer?.playerUUID).toBe(mockPlayer.playerUUID);
      expect(component.editingPlayer).not.toBe(mockPlayer); // Ensure it's a clone
    });
  

  });
});  