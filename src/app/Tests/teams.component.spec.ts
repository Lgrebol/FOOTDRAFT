import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TeamsComponent } from '../Components/teams/teams.component';
import { TeamService } from '../Serveis/team.service';
import { UserService } from '../Serveis/user.service';
import { PlayerService } from '../Serveis/player.service';
import { of, throwError } from 'rxjs';
import { Team } from '../Classes/teams/team.model';
import { User } from '../Classes/user/user.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Player } from '../Classes/players/player.model';

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

// Funció auxiliar per crear una instància de User
const createMockUser = (
  userUUID: string,
  username: string,
  email: string,
  footcoins: number
): User => {
  const user = new User();
  user.userUUID = userUUID;
  user.username = username;
  user.email = email;
  user.footcoins = footcoins;
  return user;
};

// Funció auxiliar per crear una instància de Player
const createMockPlayer = (
  playerUUID: string,
  playerName: string,
  position: string,
  teamUUID: string
): Player => {
  const player = new Player();
  // Assignem els camps via casting si cal, o bé amb els setters (si n'hi ha)
  (player as any)._playerUUID = playerUUID;
  (player as any)._playerName = playerName;
  (player as any)._position = position;
  (player as any)._teamUUID = teamUUID;
  return player;
};

describe('TeamsComponent', () => {
  let component: TeamsComponent;
  let fixture: ComponentFixture<TeamsComponent>;
  let teamServiceSpy: jasmine.SpyObj<TeamService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let playerServiceSpy: jasmine.SpyObj<PlayerService>;

  beforeEach(async () => {
    const teamSpy = jasmine.createSpyObj('TeamService', [
      'getTeams', 'addTeam', 'deleteTeam', 'assignPlayerToTeam'
    ]);
    const userSpy = jasmine.createSpyObj('UserService', ['getUsers', 'getCurrentUser']);
    const playerSpy = jasmine.createSpyObj('PlayerService', ['getReservedPlayers']);

    await TestBed.configureTestingModule({
      providers: [
        { provide: TeamService, useValue: teamSpy },
        { provide: UserService, useValue: userSpy },
        { provide: PlayerService, useValue: playerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsComponent);
    component = fixture.componentInstance;
    teamServiceSpy = TestBed.inject(TeamService) as jasmine.SpyObj<TeamService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    playerServiceSpy = TestBed.inject(PlayerService) as jasmine.SpyObj<PlayerService>;
  });

  // Test 1: Creació bàsica del component
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Carregar usuaris correctament
  it('should load the users correctly', () => {
    const teamsMock = [createMockTeam('team-uuid-1', 'Team1', 'blue', 'user-uuid-1', 'User1')];
    const usersMock = [createMockUser('user-uuid-1', 'User1', 'user1@test.com', 100)];
    const reservedPlayersMock = [createMockPlayer('p1', 'Player1', 'Forward', 'team-uuid-1')];

    teamServiceSpy.getTeams.and.returnValue(of(teamsMock));
    userServiceSpy.getUsers.and.returnValue(of(usersMock));
    userServiceSpy.getCurrentUser.and.returnValue(of(usersMock[0]));
    playerServiceSpy.getReservedPlayers.and.returnValue(of(reservedPlayersMock));

    component.ngOnInit();

    expect(component.userList.users).toEqual(usersMock);
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
  });

  // Test 3: Carregar equips correctament
  it('should load the teams correctly', () => {
    const teamsMock = [createMockTeam('team-uuid-1', 'Team1', 'blue', 'user-uuid-1', 'User1')];
    const usersMock = [createMockUser('user-uuid-1', 'User1', 'user@test.com', 100)];
    const reservedPlayersMock = [createMockPlayer('p1', 'Player1', 'Forward', 'team-uuid-1')];

    teamServiceSpy.getTeams.and.returnValue(of(teamsMock));
    userServiceSpy.getUsers.and.returnValue(of(usersMock));
    userServiceSpy.getCurrentUser.and.returnValue(of(usersMock[0]));
    playerServiceSpy.getReservedPlayers.and.returnValue(of(reservedPlayersMock));

    component.ngOnInit();

    expect(component.teams).toEqual(teamsMock);
    expect(teamServiceSpy.getTeams).toHaveBeenCalled();
  });

  // Test 4: Eliminar equip amb èxit
  it('should delete a team successfully', () => {
    const initialTeams = [
      createMockTeam('team-uuid-1', 'Team1', 'blue', 'user-uuid-1', 'User1'),
      createMockTeam('team-uuid-2', 'Team2', 'red', 'user-uuid-2', 'User2')
    ];
    component.teams = [...initialTeams];

    teamServiceSpy.deleteTeam.and.returnValue(of({}));

    component.deleteTeam('team-uuid-1');
    expect(component.teams.length).toBe(1);
    expect(component.teams.some(t => t.teamUUID === 'team-uuid-1')).toBeFalse();
  });

  // Test 5: Error en eliminar equip
  it('should handle error when deleting team', () => {
    const errorMsg = 'Error en eliminar';
    teamServiceSpy.deleteTeam.and.returnValue(throwError(() => errorMsg));
    spyOn(console, 'error');

    component.deleteTeam('invalid-uuid');
    expect(console.error).toHaveBeenCalledWith('Error eliminant equip:', errorMsg);
  });

  // Test 6: Afegir equip vàlid
  it('should add a new team with valid data', () => {
    const newTeam = createMockTeam('new-uuid', 'NewTeam', 'green', 'user-uuid-1', 'User1');
    teamServiceSpy.addTeam.and.returnValue(of(newTeam));

    // Configurem newTeam amb dades
    const team = new Team();
    team.teamName = 'NewTeam';
    team.shirtColor = 'green';
    team.userUUID = 'user-uuid-1';
    component.newTeam = team;

    component.addTeam();

    expect(component.teams).toContain(newTeam);
    expect(component.newTeam.teamName).toBe('');
  });

  // Test 7: Error en afegir equip
  it('should handle error when adding team', () => {
    const errorMsg = 'Error en afegir';
    teamServiceSpy.addTeam.and.returnValue(throwError(() => errorMsg));
    spyOn(console, 'error');

    const team = new Team();
    team.teamName = 'NewTeam';
    team.shirtColor = 'green';
    team.userUUID = 'user-uuid-1';
    component.newTeam = team;

    component.addTeam();
    expect(console.error).toHaveBeenCalledWith('Error afegint equip:', errorMsg);
  });

  // Test 8: Validar camps obligatoris en afegir equip
  it('should not add team with missing data', () => {
    component.newTeam = new Team();
    // newTeam amb camps buits
    component.newTeam.teamName = '';
    component.newTeam.shirtColor = '';
    component.newTeam.userUUID = '';
    component.addTeam();
    expect(teamServiceSpy.addTeam).not.toHaveBeenCalled();
  });
});
