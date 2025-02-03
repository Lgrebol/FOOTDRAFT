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

  // Creem el component però sense cridar detectChanges() (és a dir, sense executar ngOnInit)
  beforeEach(() => {
    fixture = TestBed.createComponent(MatchComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifiquem que no hi hagi peticions pendents
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
  
  it('loadMatchData() should fetch match data', () => {
    const mockMatch = { HomeGoals: 2, AwayGoals: 1 };
    
    component.loadMatchData(123);
    const req = httpTestingController.expectOne(`${baseUrl}/matches/123`);
    req.flush({ match: mockMatch });
    
    expect(component.match).toEqual(mockMatch);
  });
  
});
