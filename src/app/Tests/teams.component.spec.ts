// teams.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TeamsComponent } from '../Components/teams/teams.component';
import { TeamService } from '../Serveis/team.service';
import { UserService } from '../Serveis/user.service';
import { PlayerService } from '../Serveis/player.service';
import { of, throwError } from 'rxjs';
import { Team } from '../Classes/teams/team.model';
import { User } from '../Classes/user/user.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

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
    const userSpy = jasmine.createSpyObj('UserService', ['getUsers']);
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
    const usersMock = [new User('user-uuid-1', 'User1', 'user1@test.com', 100)];
    userServiceSpy.getUsers.and.returnValue(of(usersMock));

    component.ngOnInit();
    expect(component.users).toEqual(usersMock);
  });

  // Test 3: Carregar equips correctament
  it('should load the teams correctly', () => {
    const teamsMock = [new Team('team-uuid-1', 'Team1', 'blue', 'user-uuid-1')];
    teamServiceSpy.getTeams.and.returnValue(of(teamsMock));

    component.ngOnInit();
    expect(component.teams).toEqual(teamsMock);
  });

  // Test 4: Eliminar equip amb èxit
  it('should delete a team successfully', () => {
    const initialTeams = [
      new Team('team-uuid-1', 'Team1', 'blue', 'user-uuid-1'),
      new Team('team-uuid-2', 'Team2', 'red', 'user-uuid-2')
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
    const newTeam = new Team('new-uuid', 'NewTeam', 'green', 'user-uuid-1');
    teamServiceSpy.addTeam.and.returnValue(of(newTeam));

    component.newTeam = new Team('', 'NewTeam', 'green', 'user-uuid-1');
    component.addTeam();

    expect(component.teams).toContain(newTeam);
    expect(component.newTeam.teamName).toBe('');
  });

  // Test 7: Error en afegir equip
  it('should handle error when adding team', () => {
    const errorMsg = 'Error en afegir';
    teamServiceSpy.addTeam.and.returnValue(throwError(() => errorMsg));
    spyOn(console, 'error');

    component.newTeam = new Team('', 'NewTeam', 'green', 'user-uuid-1');
    component.addTeam();
    expect(console.error).toHaveBeenCalledWith('Error afegint equip:', errorMsg);
  });

  // Test 9: Validar camps obligatoris en afegir equip
  it('should not add team with missing data', () => {
    component.newTeam = new Team('', '', '', '');
    component.addTeam();
    expect(teamServiceSpy.addTeam).not.toHaveBeenCalled();
  });
});