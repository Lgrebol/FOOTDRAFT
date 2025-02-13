import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatchComponent } from './match.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { interval } from 'rxjs';

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

  // Creem el component sense executar ngOnInit encara
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
    const mockTeams = [{ TeamID: 1, TeamName: 'Team A' }, { TeamID: 2, TeamName: 'Team B' }];
    const req = httpTestingController.expectOne(`${baseUrl}/teams`);
    req.flush(mockTeams);
    expect(component.teams).toEqual(mockTeams);
  });

  it('canStartMatch() should return true with valid different teams and match not started', () => {
    component.selectedHomeTeam = 1;
    component.selectedAwayTeam = 2;
    component.matchStarted = false;
    expect(component.canStartMatch()).toBeTrue();
  });

  it('canStartMatch() should return false when teams are the same', () => {
    component.selectedHomeTeam = 1;
    component.selectedAwayTeam = 1;
    component.matchStarted = false;
    expect(component.canStartMatch()).toBeFalse();
  });

  it('canStartMatch() should return false with no teams selected', () => {
    component.selectedHomeTeam = null;
    component.selectedAwayTeam = null;
    expect(component.canStartMatch()).toBeFalse();
  });

  it('canStartMatch() should return false when match already started', () => {
    component.selectedHomeTeam = 1;
    component.selectedAwayTeam = 2;
    component.matchStarted = true;
    expect(component.canStartMatch()).toBeFalse();
  });

  it('startMatch() should create match and start polling', fakeAsync(() => {
    component.selectedHomeTeam = 1;
    component.selectedAwayTeam = 2;
    
    component.startMatch();
    const createReq = httpTestingController.expectOne(`${baseUrl}/matches`);
    createReq.flush({ matchID: 123 });
    const simulateReq = httpTestingController.expectOne(`${baseUrl}/matches/simulate`);

    tick(1000);

    const matchReq = httpTestingController.expectOne(`${baseUrl}/matches/123`);
    matchReq.flush({ match: { HomeGoals: 0, AwayGoals: 0 } });
    
    simulateReq.flush({ summary: 'done' });
    
    expect(component.matchStarted).toBeTrue();
    expect(component.match).toEqual({ HomeGoals: 0, AwayGoals: 0 });
    expect(component.matchSummary).toEqual({ summary: 'done' });
  }));

  it('resetMatch() should reset state and stop polling', () => {
    component.matchStarted = true;
    component.match = { MatchID: 123 };
    component.pollingSubscription = interval(1000).subscribe();

    spyOn(component.pollingSubscription, 'unsubscribe');
    component.resetMatch();

    const resetReq = httpTestingController.expectOne(`${baseUrl}/matches/reset`);
    resetReq.flush({});

    expect(component.match).toBeNull();
    expect(component.matchSummary).toBeNull();
    expect(component.matchStarted).toBeFalse();
    expect(component.pollingSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('loadMatchData() should fetch match data', () => {
    const mockMatch = { HomeGoals: 2, AwayGoals: 1 };
    
    component.loadMatchData(123);
    const req = httpTestingController.expectOne(`${baseUrl}/matches/123`);
    req.flush({ match: mockMatch });
    
    expect(component.match).toEqual(mockMatch);
  });

  it('should disable start button when teams are the same', () => {
    fixture.detectChanges();
    const teamsReq = httpTestingController.expectOne(`${baseUrl}/teams`);
    teamsReq.flush([{ TeamID: 1, TeamName: 'Team A' }, { TeamID: 2, TeamName: 'Team B' }]);
    
    fixture.detectChanges();
    component.selectedHomeTeam = 1;
    component.selectedAwayTeam = 1;
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('#startButton');
    expect(button.disabled).toBeTrue();
  });

    it('should alert if no teams are selected', () => {
      spyOn(window, 'alert');
      // No es seleccionen equips
      component.selectedHomeTeam = null;
      component.selectedAwayTeam = null;
      component.betAmount = 10;
      component.placeBet();
      expect(window.alert).toHaveBeenCalledWith("⚠ Selecciona els equips abans d'apostar.");
    });

    it('should alert if the same team is selected for both home and away', () => {
      spyOn(window, 'alert');
      component.selectedHomeTeam = 1;
      component.selectedAwayTeam = 1;
      component.betAmount = 10;
      component.placeBet();
      expect(window.alert).toHaveBeenCalledWith("⚠ No pots apostar en un partit amb dos equips iguals.");
    });

    it('should alert if bet amount is <= 0', () => {
      spyOn(window, 'alert');
      component.selectedHomeTeam = 1;
      component.selectedAwayTeam = 2;
      component.betAmount = 0;
      component.placeBet();
      expect(window.alert).toHaveBeenCalledWith("⚠ L'aposta ha de ser superior a 0.");
    });

    it('should return headers with token if authToken exists in localStorage', () => {
      localStorage.setItem('authToken', 'test-token');
      const headers = component['getAuthHeaders']();
      expect(headers.get('Authorization')).toEqual('Bearer test-token');
      expect(headers.get('Content-Type')).toEqual('application/json');
    });

    it('hauria de retornar headers buits i registrar un error si no hi ha authToken', () => {
      localStorage.removeItem('authToken');
      spyOn(console, 'error');
      const headers = component['getAuthHeaders']();
      expect(console.error).toHaveBeenCalledWith('No token found in localStorage');
      expect(headers.has('Authorization')).toBeFalse();
      expect(headers.get('Content-Type')).toBeNull(); // No s'ha definit cap Content-Type
    });

    it('should send bet and alert success when bet is valid', fakeAsync(() => {
      // Afegim un token a localStorage per simular autenticació
      localStorage.setItem('authToken', 'test-token');
      spyOn(window, 'alert');

      component.selectedHomeTeam = 1;
      component.selectedAwayTeam = 2;
      component.betAmount = 50;
      component.predictedWinner = 'home';

      component.placeBet();

      const req = httpTestingController.expectOne(`${baseUrl}/bets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        homeTeamID: 1,
        awayTeamID: 2,
        amount: 50,
        predictedWinner: 'home'
      });
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');

      req.flush({});
      tick();
      expect(window.alert).toHaveBeenCalledWith('✅ Aposta registrada correctament!');

      localStorage.removeItem('authToken');
    }));

    it('should send bet without auth header if no token is present', fakeAsync(() => {
      // Assegurem que no hi ha token a localStorage
      localStorage.removeItem('authToken');
      spyOn(window, 'alert');

      component.selectedHomeTeam = 1;
      component.selectedAwayTeam = 2;
      component.betAmount = 50;
      component.predictedWinner = 'home';

      component.placeBet();

      const req = httpTestingController.expectOne(`${baseUrl}/bets`);
      expect(req.request.method).toBe('POST');
      // Com que no hi ha token, no s'ha d'enviar l'header 'Authorization'
      expect(req.request.headers.get('Authorization')).toBeNull();

      req.flush({});
      tick();
      expect(window.alert).toHaveBeenCalledWith('✅ Aposta registrada correctament!');
    }));
});
