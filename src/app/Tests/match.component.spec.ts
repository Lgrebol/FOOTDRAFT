import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatchComponent } from '../Components/match/match.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { interval } from 'rxjs';
import { Match } from '../Classes/match/match.model';

describe('MatchComponent', () => {
  let component: MatchComponent;
  let fixture: ComponentFixture<MatchComponent>;
  let httpTestingController: HttpTestingController;
  const baseUrl = 'http://localhost:3000/api/v1';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, MatchComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load teams on initialization', () => {
    fixture.detectChanges();
    const mockTeams = [
      { teamUUID: 'uuid1', teamName: 'Team A' },
      { teamUUID: 'uuid2', teamName: 'Team B' }
    ];
    // S'assumeix que el TeamService realitza una crida GET a `${baseUrl}/teams`
    const req = httpTestingController.expectOne(`${baseUrl}/teams`);
    req.flush(mockTeams);
    expect(component.teams).toEqual(mockTeams);
  });

  it('canStartMatch() should return true with valid different teams and match not started', () => {
    component.selectedHomeTeam = 'uuid1';
    component.selectedAwayTeam = 'uuid2';
    component.matchStarted = false;
    expect(component.canStartMatch()).toBeTrue();
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

  it('startMatch() should create match and start polling', fakeAsync(() => {
    component.selectedHomeTeam = 'uuid1';
    component.selectedAwayTeam = 'uuid2';
    
    component.startMatch();
    const createReq = httpTestingController.expectOne(`${baseUrl}/matches`);
    // S'imul·la la resposta del servidor amb un matchID (ara com a string)
    createReq.flush({ matchID: '123' });
    
    // Simulem una petició de polling després d'1 segon
    tick(1000);
    const pollReq = httpTestingController.expectOne(`${baseUrl}/matches/123`);
    const matchData = {
      HomeGoals: 0,
      AwayGoals: 0,
      CurrentMinute: 0,
      HomeTeamUUID: component.selectedHomeTeam,
      AwayTeamUUID: component.selectedAwayTeam,
      TournamentUUID: '7E405744-880B-4D33-84A1-FCEB95C076A5',
      MatchDate: new Date().toISOString(),
      events: []
    };
    pollReq.flush({ match: matchData });
    
    // Simulem la crida de simulació del partit
    const simulateReq = httpTestingController.expectOne(`${baseUrl}/matches/simulate`);
    simulateReq.flush({ message: 'Simulació completada' });
    
    expect(component.matchStarted).toBeTrue();
    expect(component.match?.homeGoals).toEqual(0);
  }));

  it('resetMatch() should reset state and stop polling', () => {
    // Creem una instància vàlida de Match per provar el reinici
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
    const resetReq = httpTestingController.expectOne(`${baseUrl}/matches/reset`);
    resetReq.flush({});
    
    expect(component.match).toBeNull();
    expect(component.matchSummary).toBeNull();
    expect(component.matchStarted).toBeFalse();
    expect(component.pollingSubscription?.unsubscribe).toHaveBeenCalled();
  });

  it('should disable start button when teams are the same', () => {
    fixture.detectChanges();
    const teamsReq = httpTestingController.expectOne(`${baseUrl}/teams`);
    teamsReq.flush([
      { teamUUID: 'uuid1', teamName: 'Team A' },
      { teamUUID: 'uuid2', teamName: 'Team B' }
    ]);
    
    fixture.detectChanges();
    component.selectedHomeTeam = 'uuid1';
    component.selectedAwayTeam = 'uuid1';
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('.btn-start');
    expect(button.disabled).toBeTrue();
  });

  describe('placeBet()', () => {
    beforeEach(() => {
      // Per a poder fer una aposta vàlida, assegurem que hi hagi un partit
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

    it('should send bet and alert success when bet is valid', fakeAsync(() => {
      // Utilitzem la clau 'token' (ara que al servei es busca aquest valor)
      localStorage.setItem('token', 'test-token');
      spyOn(window, 'alert');

      component.placeBet();

      const req = httpTestingController.expectOne(`${baseUrl}/bets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        matchUUID: '123',
        homeTeamUUID: 'uuid1',
        awayTeamUUID: 'uuid2',
        amount: 50,
        predictedWinner: 'home'
      });
      // S'espera que l'header d'autenticació contingui el token
      expect(req.request.headers.get('Authorization')).toEqual('Bearer test-token');

      req.flush({});
      tick();
      expect(window.alert).toHaveBeenCalledWith('Aposta realitzada amb èxit!');
      localStorage.removeItem('token');
    }));

    it('should send bet with empty auth header if no token is present', fakeAsync(() => {
      localStorage.removeItem('token');
      spyOn(window, 'alert');

      component.placeBet();

      const req = httpTestingController.expectOne(`${baseUrl}/bets`);
      expect(req.request.method).toBe('POST');
      // Sense token, el valor serà "Bearer " (cadena buida després de Bearer)
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
      expect(req.request.method).toBe('POST');

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
