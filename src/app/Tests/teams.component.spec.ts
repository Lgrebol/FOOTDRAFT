import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TeamsComponent } from '../Components/teams/teams.component';
import { TeamService } from '../Serveis/team.service';
import { PlayerService } from '../Serveis/player.service';
import { TeamAssignmentService } from '../Serveis/team-assignment.service';
import { of, throwError } from 'rxjs';
import { Team } from '../Classes/teams/team.model';
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

const createMockPlayer = (
  playerUUID: string,
  playerName: string,
  position: string,
  teamUUID: string
): Player => {
  const player = new Player();
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
  let playerServiceSpy: jasmine.SpyObj<PlayerService>;
  let teamAssignmentServiceSpy: jasmine.SpyObj<TeamAssignmentService>;

  beforeEach(async () => {
    const teamSpy = jasmine.createSpyObj('TeamService', [
      'getTeams', 'addTeam', 'deleteTeam', 'assignPlayerToTeam'
    ]);
    const playerSpy = jasmine.createSpyObj('PlayerService', ['getReservedPlayers']);
    const teamAssignmentSpy = jasmine.createSpyObj('TeamAssignmentService', ['loadReservedPlayers', 'assignPlayerToTeam'], {
      reservedPlayers$: of([]) 
    });

    teamSpy.getTeams.and.returnValue(of([]));

    localStorage.setItem('userUUID', 'user-uuid-1');

    await TestBed.configureTestingModule({
      providers: [
        { provide: TeamService, useValue: teamSpy },
        { provide: PlayerService, useValue: playerSpy },
        { provide: TeamAssignmentService, useValue: teamAssignmentSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsComponent);
    component = fixture.componentInstance;
    teamServiceSpy = TestBed.inject(TeamService) as jasmine.SpyObj<TeamService>;
    playerServiceSpy = TestBed.inject(PlayerService) as jasmine.SpyObj<PlayerService>;
    teamAssignmentServiceSpy = TestBed.inject(TeamAssignmentService) as jasmine.SpyObj<TeamAssignmentService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the teams correctly', () => {
    const teamsMock = [createMockTeam('team-uuid-1', 'Team1', 'blue', 'user-uuid-1', 'User1')];
    teamServiceSpy.getTeams.and.returnValue(of(teamsMock));

    component.ngOnInit();

    expect(component.teams).toEqual(teamsMock);
    expect(teamServiceSpy.getTeams).toHaveBeenCalled();
  });

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

  it('should handle error when deleting team', () => {
    const errorMsg = 'Error en eliminar';
    teamServiceSpy.deleteTeam.and.returnValue(throwError(() => errorMsg));
    spyOn(console, 'error');

    component.deleteTeam('invalid-uuid');
    expect(console.error).toHaveBeenCalledWith('Error eliminant equip:', errorMsg);
  });

  it('should add a new team with valid data', () => {
    const newTeam = createMockTeam('new-uuid', 'NewTeam', 'green', 'user-uuid-1', 'User1');
    teamServiceSpy.addTeam.and.returnValue(of(newTeam));

    const team = new Team();
    team.teamName = 'NewTeam';
    team.shirtColor = 'green';
    team.userUUID = 'user-uuid-1';
    component.newTeam = team;

    component.addTeam();

    expect(component.teams).toContain(newTeam);
    expect(component.newTeam.teamName).toBe('');
  });

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

  it('should not add team with missing data', () => {
    component.newTeam = new Team();
    component.newTeam.teamName = '';
    component.newTeam.shirtColor = '';
    component.newTeam.userUUID = '';
    component.addTeam();
    expect(teamServiceSpy.addTeam).not.toHaveBeenCalled();
  });
});
