import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentComponent } from '../Components/tournament/tournament.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../Serveis/tournament.service';
import { Tournament } from '../Classes/tournament/tournament.model';

describe('TournamentComponent', () => {
  let component: TournamentComponent;
  let fixture: ComponentFixture<TournamentComponent>;
  let httpTestingController: HttpTestingController;
  const API_URL = 'http://localhost:3000/api/v1';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, TournamentComponent],
      providers: [TournamentService]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);

    // Handle initial data load
    const req = httpTestingController.expectOne(`${API_URL}/tournaments`);
    req.flush([]);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tournaments', () => {
    const mockTournaments = [
      new Tournament('uuid1', 'Test1', 'Knockout', '2024-06-01', '2024-06-10'),
      new Tournament('uuid2', 'Test2', 'League', '2024-07-01', '2024-07-15')
    ];

    component.ngOnInit();
    
    const req = httpTestingController.expectOne(`${API_URL}/tournaments`);
    req.flush(mockTournaments.map(t => ({
      TournamentUUID: t.tournamentUUID,
      TournamentName: t.tournamentName,
      TournamentType: t.tournamentType,
      StartDate: t.startDate,
      EndDate: t.endDate
    })));

    expect(component.tournaments).toEqual(mockTournaments);
  });

  it('should add a tournament and reset the form', () => {
    // Set form values
    component.tournamentForm.tournament.tournamentName = 'New Tournament';
    component.tournamentForm.tournament.tournamentType = 'Knockout';
    component.tournamentForm.tournament.startDate = '2024-08-01';
    component.tournamentForm.tournament.endDate = '2024-08-10';

    component.addTournament();

    // Verify POST request
    const postReq = httpTestingController.expectOne(`${API_URL}/tournaments`);
    expect(postReq.request.body).toEqual({
      tournamentName: 'New Tournament',
      tournamentType: 'Knockout',
      startDate: '2024-08-01',
      endDate: '2024-08-10'
    });
    postReq.flush({});

    // Verify subsequent GET request
    const getReq = httpTestingController.expectOne(`${API_URL}/tournaments`);
    getReq.flush([]);

    // Verify form reset
    expect(component.tournamentForm.tournament.tournamentName).toBe('');
    expect(component.tournamentForm.success).toBe('Torneig afegit correctament');
  });

  it('should delete a tournament', () => {
    const tournamentUUID = 'uuid1';
    
    component.deleteTournament(tournamentUUID);

    // Verify DELETE request
    const deleteReq = httpTestingController.expectOne(`${API_URL}/tournaments/${tournamentUUID}`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});

    // Verify UI update
    expect(component.tournaments.some(t => t.tournamentUUID === tournamentUUID)).toBeFalse();
  });

  it('should not add a tournament if name is missing', () => {
    component.tournamentForm.tournament.tournamentName = '';
    component.tournamentForm.tournament.startDate = '2024-08-01';

    component.addTournament();

    httpTestingController.expectNone(`${API_URL}/tournaments`);
    expect(component.tournamentForm.error).toBe('Error afegint torneig');
  });
});