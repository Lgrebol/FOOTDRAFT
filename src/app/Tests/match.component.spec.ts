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

  // Funció auxiliar per crear mock de Team
  const createMockTeam = (teamData: any): Team =>
    new Team(
      teamData.TeamUUID,
      teamData.TeamName,
      teamData.ShirtColor,
      teamData.UserUUID,
      teamData.Username
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, MatchComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    
    // Aquesta crida a detectChanges() dispara el ngOnInit i, per tant, la crida a loadTeams()
    fixture.detectChanges();
    // Capturar i gestionar totes les peticions GET a /teams que s'hagin disparat
    const teamRequests = httpTestingController.match(`${baseUrl}/teams`);
    teamRequests.forEach(req => req.flush([]));
  });

  afterEach(() => {
    // Finalment, si quedessin peticions GET a /teams sense gestionar, les gestionem
    const pendingTeams = httpTestingController.match(`${baseUrl}/teams`);
    pendingTeams.forEach(req => req.flush([]));
    httpTestingController.verify();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });



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

  it('resetMatch() should reset state and stop polling', () => {
    component.match = new Match(
      '123',
      'uuid1',
      'uuid2',
      0,
      0,
      0,
      'tournamentUUID',
      new Date().toISOString(),
      []
    );
    component.matchStarted = true;
    component.selectedHomeTeam = 'uuid1';
    component.selectedAwayTeam = 'uuid2';
    component.pollingSubscription = interval(1000).subscribe();
    spyOn(component.pollingSubscription, 'unsubscribe');
    
    component.resetMatch();
    
    // Primer gestionem la petició POST de reset
    const resetReq = httpTestingController.expectOne(`${baseUrl}/matches/reset`);
    resetReq.flush({});
    // Després, resetMatch() crida loadTeams(), per la qual cosa gestionem totes les peticions GET a /teams
    const teamRequests = httpTestingController.match(`${baseUrl}/teams`);
    teamRequests.forEach(req => req.flush([]));
    
    expect(component.match).toBeNull();
    expect(component.matchSummary).toBeNull();
    expect(component.matchStarted).toBeFalse();
    expect(component.pollingSubscription?.unsubscribe).toHaveBeenCalled();
  });

  describe('placeBet()', () => {
    beforeEach(() => {
      component.match = new Match(
        '123',
        'uuid1',
        'uuid2',
        0,
        0,
        0,
        'tournamentUUID',
        new Date().toISOString(),
        []
      );
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
