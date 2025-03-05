import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatchComponent } from '../Components/match/match.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { interval } from 'rxjs';
import { Match } from '../Classes/match/match.model';
import { Team } from '../Classes/teams/team.model';

const baseUrl = 'http://localhost:3000/api/v1';

describe('MatchComponent', () => {
  let component: MatchComponent;
  let fixture: ComponentFixture<MatchComponent>;
  let httpTestingController: HttpTestingController;

  // Funció auxiliar per crear un mock de Team, si és necessari
  const createMockTeam = (teamData: any): Team => {
    // Assumim que el constructor de Team és buit i que es van assignar les propietats amb setters
    const team = new Team();
    team.teamUUID = teamData.TeamUUID;
    team.teamName = teamData.TeamName;
    team.shirtColor = teamData.ShirtColor;
    team.userUUID = teamData.UserUUID;
    team.username = teamData.Username;
    return team;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, MatchComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    
    // Dispara el ngOnInit i gestiona les peticions GET a /teams i /tournaments
    fixture.detectChanges();
    const teamRequests = httpTestingController.match(`${baseUrl}/teams`);
    teamRequests.forEach(req => req.flush([]));
    const tournamentRequests = httpTestingController.match(`${baseUrl}/tournaments`);
    tournamentRequests.forEach(req => req.flush([]));
  });

  afterEach(() => {
    // Gestiona qualsevol petició pendent a /teams o /tournaments
    const pendingTeams = httpTestingController.match(`${baseUrl}/teams`);
    pendingTeams.forEach(req => req.flush([]));
    const pendingTournaments = httpTestingController.match(`${baseUrl}/tournaments`);
    pendingTournaments.forEach(req => req.flush([]));
    httpTestingController.verify();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // Tests per a canStartMatch()
  it('canStartMatch() should return false when teams are the same', () => {
    component.selectedHomeTeam = 'uuid1';
    component.selectedAwayTeam = 'uuid1';
    component.matchStarted = false;
    expect(component.canStartMatch()).toBeFalse();
  });

  it('canStartMatch() should return false with no teams selected', () => {
    component.selectedHomeTeam = null;
    component.selectedAwayTeam = null;
    expect(component.canStartMatch()).toBeFalse();
  });

  it('canStartMatch() should return false when match already started', () => {
    component.selectedHomeTeam = 'uuid1';
    component.selectedAwayTeam = 'uuid2';
    component.matchStarted = true;
    expect(component.canStartMatch()).toBeFalse();
  });

  // Tests per a placeBet()
  describe('placeBet()', () => {
    beforeEach(() => {
      // Configurem un match simulat
      component.match = Match.createNew('tournamentUUID', 'uuid1', 'uuid2', new Date());
      component.selectedHomeTeam = 'uuid1';
      component.selectedAwayTeam = 'uuid2';
      component.betAmount = 50;
      component.predictedWinner = 'home';
    });

    it('should send bet with empty auth header if no token is present', fakeAsync(() => {
      localStorage.removeItem('token');
      spyOn(window, 'alert');
      
      component.placeBet();
      
      const req = httpTestingController.expectOne(`${baseUrl}/bets`);
      expect(req.request.headers.get('Authorization')).toEqual('Bearer ');
      
      req.flush({});
      tick();
      expect(window.alert).toHaveBeenCalledWith('Aposta realitzada amb èxit!');
    }));

    it('should alert error when bet fails', fakeAsync(() => {
      localStorage.setItem('token', 'test-token');
      spyOn(window, 'alert');
      
      component.placeBet();
      
      const req = httpTestingController.expectOne(`${baseUrl}/bets`);
      const errorResponse = { status: 400, statusText: 'Bad Request' };
      req.flush({ error: 'Invalid bet' }, errorResponse);
      tick();
      expect(window.alert).toHaveBeenCalledWith('Invalid bet');
      localStorage.removeItem('token');
    }));

    it('should not send bet if match is not defined', () => {
      component.match = null;
      spyOn(window, 'alert');
      component.placeBet();
      httpTestingController.expectNone(`${baseUrl}/bets`);
      expect(window.alert).not.toHaveBeenCalled();
    });
  });
});
