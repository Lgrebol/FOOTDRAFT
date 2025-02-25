import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamsComponent } from '../Components/teams/teams.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { User } from '../Classes/user/user.model';
import { Player } from '../Classes/players/player.model';

describe('TeamsComponent', () => {
  let component: TeamsComponent;
  let fixture: ComponentFixture<TeamsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Mock data for teams
  const mockTeams = [
    {
      teamUUID: 'uuid-123',
      teamName: 'Team A',
      shirtColor: 'Blue',
      userUUID: 'user-uuid-123',
      username: 'PlayerOne',
      displayInfo: () => 'Team A - Blue',
      toPayload: () => ({})
    }
  ];

  const mockUsers = [
    new User(
      'uuid-user-123',    
      'UserA',           
      'usera@example.com',
      100,              
      'password',       
      'password' 
    )
  ];

  const mockReservedPlayers = [
    { playerUUID: '10', playerName: 'Player A' } as Player
  ];

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the teams correctly', () => {
    const teamsReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    expect(teamsReq.request.method).toBe('GET');
    teamsReq.flush(mockTeams);

    const usersReq = httpMock.expectOne('http://localhost:3000/api/v1/users');
    usersReq.flush([]);

    fixture.detectChanges();
    expect(component.teams).toEqual(mockTeams);
  });

  it('should load the users correctly', () => {
    const usersReq = httpMock.expectOne('http://localhost:3000/api/v1/users');
    expect(usersReq.request.method).toBe('GET');
    usersReq.flush(mockUsers);
    expect(component.users).toEqual(mockUsers);
  });

  it('should add a new team when the data is valid', () => {
    component.newTeam.teamName = 'New Team';
    component.newTeam.shirtColor = 'Green';
    component.newTeam.userUUID = '1';

    component.addTeam();

    // Verify the POST request
    const postReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    postReq.flush({});
    
    // Verify subsequent GET requests that happen after addTeam()
    const teamsReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    teamsReq.flush(mockTeams);
    
    const usersReq = httpMock.expectOne('http://localhost:3000/api/v1/users');
    usersReq.flush(mockUsers);
  });



  it('should not add a team if data is missing', () => {
    // Handle initial component data loading
    const getTeamsReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    getTeamsReq.flush([]);
    const getUsersReq = httpMock.expectOne('http://localhost:3000/api/v1/users');
    getUsersReq.flush([]);
  
    // Set invalid data
    component.newTeam.teamName = '';
    component.newTeam.shirtColor = '';
    component.newTeam.userUUID = null as any;
  
    // Trigger addTeam
    component.addTeam();
  
    // Verify no POST request was made
    httpMock.expectNone('http://localhost:3000/api/v1/teams');
    
    // Verify no additional data reloading occurred
    httpMock.expectNone('http://localhost:3000/api/v1/teams');
    httpMock.expectNone('http://localhost:3000/api/v1/users');
  });

  it('should show an error if addTeam doesn\'t work', () => {
    spyOn(console, 'error');

    const initialGetReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    initialGetReq.flush([]);

    component.newTeam.teamName = 'New Team';
    component.newTeam.shirtColor = 'Green';
    component.newTeam.userUUID = '1';

    component.addTeam();

    const postReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    postReq.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

    expect(console.error).toHaveBeenCalledWith('Error afegint l\'equip:', jasmine.anything());
  });
  
  it('should delete teams correctly', () => {
    const teamUUID = 'uuid-123';
    component.deleteTeam(teamUUID);

    // Verify DELETE request
    const deleteReq = httpMock.expectOne(`http://localhost:3000/api/v1/teams/${teamUUID}`);
    deleteReq.flush({});
    
    // Verify subsequent data reload
    const teamsReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    teamsReq.flush(mockTeams);
    
    const usersReq = httpMock.expectOne('http://localhost:3000/api/v1/users');
    usersReq.flush(mockUsers);
  });

  it('should show an error if deleteTeam doesn\'t work', () => {
    spyOn(console, 'error');

    const teamUUID = 'uuid-123';
    component.deleteTeam(teamUUID);

    const req = httpMock.expectOne(`http://localhost:3000/api/v1/teams/${teamUUID}`);
    req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

    expect(console.error).toHaveBeenCalledWith('Error eliminant l\'equip:', jasmine.anything());
  });

  it('should load reserved players correctly', () => {
    const initialReq = httpMock.expectOne(`http://localhost:3000/api/v1/reserve/${component.currentUserId}`);
    initialReq.flush([]);

    component.fetchReservedPlayers();

    const req = httpMock.expectOne(`http://localhost:3000/api/v1/reserve/${component.currentUserId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReservedPlayers);

    fixture.detectChanges();

    expect(component.reservedPlayers).toEqual(mockReservedPlayers);
  });

  it('should show an error if fetchReservedPlayers fails', () => {
    spyOn(console, 'error');

    const initialReq = httpMock.expectOne(`http://localhost:3000/api/v1/reserve/${component.currentUserId}`);
    initialReq.flush([]);

    component.fetchReservedPlayers();

    const req = httpMock.expectOne(`http://localhost:3000/api/v1/reserve/${component.currentUserId}`);
    req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

    expect(console.error).toHaveBeenCalledWith('Error carregant les reserves:', jasmine.anything());
  });

  it('should assign a reserved player to a team correctly', () => {
    spyOn(window, 'alert');
    spyOn(component, 'fetchReservedPlayers');

    component.selectedTeamId = '5';
    component.selectedPlayerId = '10';

    component.assignPlayerToTeam();

    const req = httpMock.expectOne(`http://localhost:3000/api/v1/teams/5/add-player-from-reserve`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      playerId: '10',
      userID: component.currentUserId
    });

    req.flush({ message: 'Jugador assignat correctament' });

    fixture.detectChanges();

    expect(window.alert).toHaveBeenCalledWith('Jugador assignat correctament');
    expect(component.fetchReservedPlayers).toHaveBeenCalled();
    expect(component.selectedTeamId).toBeNull();
    expect(component.selectedPlayerId).toBeNull();
  });

  it('should alert if assignPlayerToTeam is called with missing selection', () => {
    spyOn(window, 'alert');

    component.selectedTeamId = null;
    component.selectedPlayerId = null;

    component.assignPlayerToTeam();

    expect(window.alert).toHaveBeenCalledWith('Has de seleccionar un equip i un jugador reservat.');

    httpMock.expectNone((req) => req.url.includes('/add-player-from-reserve') && req.method === 'POST');
  });

  it('should show an error if assignPlayerToTeam fails', () => {
    spyOn(window, 'alert');
    spyOn(console, 'error');

    component.selectedTeamId = '5';
    component.selectedPlayerId = '10';

    component.assignPlayerToTeam();

    const req = httpMock.expectOne(`http://localhost:3000/api/v1/teams/5/add-player-from-reserve`);
    expect(req.request.method).toBe('POST');

    req.flush({ error: 'Error assignant jugador' }, { status: 500, statusText: 'Internal Server Error' });

    expect(console.error).toHaveBeenCalledWith('Error assignant el jugador a l\'equip:', jasmine.anything());
    expect(window.alert).toHaveBeenCalledWith('Error assignant jugador');
  });
});