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
): Team => {
  const team = new Team();
  team.teamUUID = teamUUID;
  team.teamName = teamName;
  team.shirtColor = shirtColor;
  team.userUUID = userUUID;
  team.username = username;
  return team;
};

// Funció auxiliar per crear una instància de Player
const createMockPlayer = (
  playerUUID: string,
  playerName: string,
  position: string,
  teamUUID: string,
  isActive: boolean,
  isForSale: boolean,
  price: number,
  height: number,
  speed: number,
  shooting: number,
  imageUrl: string,
  points: number,
  teamName: string
): Player => {
  const player = new Player();
  // Com el constructor és buit, assignem directament als camps privats mitjançant casting
  (player as any)._playerUUID = playerUUID;
  (player as any)._playerName = playerName;
  (player as any)._position = position;
  (player as any)._teamUUID = teamUUID;
  (player as any)._isActive = isActive;
  (player as any)._isForSale = isForSale;
  (player as any)._price = price;
  (player as any)._height = height;
  (player as any)._speed = speed;
  (player as any)._shooting = shooting;
  (player as any)._imageUrl = imageUrl;
  (player as any)._points = points;
  (player as any)._teamName = teamName;
  return player;
};

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
    it('should load the players and teams correctly', () => {
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
    
      // Forcem ngOnInit
      component.ngOnInit();
    
      // Gestionem la petició GET per als jugadors
      const reqPlayers = httpMock.match('http://localhost:3000/api/v1/players');
      expect(reqPlayers.length).toBeGreaterThanOrEqual(1);
      reqPlayers.forEach(req => {
        expect(req.request.method).toBe('GET');
        req.flush(mockPlayers);
      });
    
      // Gestionem la petició GET per als equips
      const reqTeams = httpMock.match('http://localhost:3000/api/v1/teams');
      expect(reqTeams.length).toBeGreaterThanOrEqual(1);
      reqTeams.forEach(req => {
        expect(req.request.method).toBe('GET');
        req.flush(mockTeams);
      });
    
      expect(component.playerList.players.length).toBe(2);
      expect(component.teamList.teams.length).toBe(2);
    });
  });

  describe('addPlayer', () => {
    beforeEach(() => {
      const reqPlayers = httpMock.match(
        req => req.method === 'GET' && req.url === 'http://localhost:3000/api/v1/players'
      );
      reqPlayers.forEach(req => req.flush([]));
  
      const reqTeams = httpMock.match(
        req => req.method === 'GET' && req.url === 'http://localhost:3000/api/v1/teams'
      );
      reqTeams.forEach(req => req.flush([]));
    });
  
    it('should add new player correctly', () => {
      // Configurem equips per a que la validació passi
      const mockTeams = [createMockTeam('teamC', 'Team C', 'green', 'u3', 'User3')];
      component.teamList.teams = mockTeams;
  
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
  
      expect(component.playerList.players.length).toBe(1);
      expect(component.playerList.players[0].playerName).toBe('New Player');
      // Comprovem que newPlayer s'ha reinicialitzat
      expect(component.newPlayer.playerName).toEqual('');
      expect(component.newPlayer.position).toEqual('');
      expect(component.newPlayer.teamUUID).toEqual('');
      expect(component.newPlayer.price).toEqual(0);
      expect(component.newPlayer.height).toEqual(0);
      expect(component.newPlayer.speed).toEqual(0);
      expect(component.newPlayer.shooting).toEqual(0);
      expect(component.newPlayer.imageFile).toBeUndefined();
    });
  
    it('should not add a player if required fields are missing', () => {
      const mockTeams = [createMockTeam('teamA', 'Team A', 'red', 'u1', 'User1')];
      component.teamList.teams = mockTeams;
  
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
      component.teamList.teams = mockTeams;
      
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
  
    it('should not add new player if no teams are available', () => {
      component.teamList.teams = [];
      
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
      
      const httpSpy = spyOn(TestBed.inject(PlayerService)['http'], 'post').and.callThrough();
      spyOn(window, 'alert');
  
      component.addPlayer();
  
      expect(httpSpy).not.toHaveBeenCalled();
      httpMock.expectNone('http://localhost:3000/api/v1/players');
    });
  });
  
  describe('deletePlayer', () => {
    it('should delete a player correctly', () => {
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
    
      const reqPlayers = httpMock.match('http://localhost:3000/api/v1/players');
      reqPlayers.forEach(req => {
        expect(req.request.method).toBe('GET');
        req.flush(mockPlayers);
      });
    
      const reqTeams = httpMock.match('http://localhost:3000/api/v1/teams');
      reqTeams.forEach(req => {
        expect(req.request.method).toBe('GET');
        req.flush(mockTeams);
      });
    
      expect(component.playerList.players.length).toBe(2);
      expect(component.teamList.teams.length).toBe(2);
    
      const playerId = '1';
      component.deletePlayer(playerId);
    
      const deleteReq = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});
    
      expect(component.playerList.players.find(p => p.playerUUID === playerId)).toBeUndefined();
    });
    
    it('should show an error if deletePlayer fails', () => {
      spyOn(console, 'error');
    
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
      const reqPlayers = httpMock.match('http://localhost:3000/api/v1/players');
      reqPlayers.forEach(req => req.flush([]));
      const reqTeams = httpMock.match('http://localhost:3000/api/v1/teams');
      reqTeams.forEach(req => req.flush([]));
  
      mockPlayer = createMockPlayer(
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
        'image.jpg',
        0,
        'Team A'
      );
      component.playerList.players = [mockPlayer];
      component.teamList.teams = [createMockTeam('teamA', 'Team A', 'blue', 'user1', 'User 1')];
    });
  
    it('should clone the player correctly for editing', () => {
      component.editPlayer(mockPlayer);
      expect(component.editingPlayer).toBeTruthy();
      expect(component.editingPlayer?.playerUUID).toBe(mockPlayer.playerUUID);
      expect(component.editingPlayer).not.toBe(mockPlayer); // És una còpia
    });
  
    it('should update player data correctly', () => {
      component.editPlayer(mockPlayer);
      const editedPlayer = component.editingPlayer!;
      editedPlayer.playerName = 'New Name';
      editedPlayer.position = 'Midfielder';
      editedPlayer.price = 150;
      editedPlayer.imageFile = new File([''], 'new-image.jpg');
  
      component.updatePlayer();
  
      const req = httpMock.expectOne(`http://localhost:3000/api/v1/players/${mockPlayer.playerUUID}`);
      expect(req.request.method).toBe('PUT');
      const formData = req.request.body as FormData;
      expect(formData.get('playerName')).toBe('New Name');
      expect(formData.get('position')).toBe('Midfielder');
      expect(formData.get('price')).toBe('150');
      expect(formData.has('image')).toBeTrue();
  
      req.flush({
        PlayerID: mockPlayer.playerUUID,
        PlayerName: 'New Name',
        Position: 'Midfielder',
        TeamID: mockPlayer.teamUUID,
        IsActive: mockPlayer.isActive,
        IsForSale: mockPlayer.isForSale,
        Price: 150,
        Height: mockPlayer.height,
        Speed: mockPlayer.speed,
        Shooting: mockPlayer.shooting,
        PlayerImage: 'new-image.jpg',
        Points: mockPlayer.points,
        TeamName: 'Team A'
      });
  
      expect(component.playerList.players[0].playerName).toBe('New Name');
      expect(component.editingPlayer).toBeNull();
    });
  
    it('should show an error on update failure', () => {
      component.editPlayer(mockPlayer);
      spyOn(console, 'error');
  
      component.updatePlayer();
      const req = httpMock.expectOne(`http://localhost:3000/api/v1/players/${mockPlayer.playerUUID}`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
  
      expect(console.error).toHaveBeenCalled();
    });
  
    it('should not update with invalid data', () => {
      component.editPlayer(mockPlayer);
      const editedPlayer = component.editingPlayer!;
      
      editedPlayer.playerName = ''; // Dades invàlides
      spyOn(window, 'alert');
  
      component.updatePlayer();
      
      httpMock.expectNone(`http://localhost:3000/api/v1/players/${mockPlayer.playerUUID}`);
      expect(window.alert).toHaveBeenCalled();
    });
  
    it('should handle image selection in edit mode', () => {
      component.editPlayer(mockPlayer);
      const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } } as unknown as Event;
      component.onFileSelected(event, true);
      expect(component.editingPlayer?.imageFile).toBe(file);
    });
  
    it('should cancel editing correctly', () => {
      component.editPlayer(mockPlayer);
      component.cancelEdit();
      expect(component.editingPlayer).toBeNull();
    });
  });
});
