import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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

    // Handle the initial GET request triggered by the service constructor.
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

    // Instead of calling ngOnInit() again (it was already called),
    // simulate a change in the service by pushing new data into its BehaviorSubject.
    (component['tournamentService'] as any).tournamentsSubject.next(mockTournaments);
    fixture.detectChanges();

    expect(component.tournaments).toEqual(mockTournaments);
  });

  it('should add a tournament and reset the form', fakeAsync(() => {
    // Set form values.
    component.tournamentForm.tournament.tournamentName = 'New Tournament';
    component.tournamentForm.tournament.tournamentType = 'Knockout';
    component.tournamentForm.tournament.startDate = '2024-08-01';
    component.tournamentForm.tournament.endDate = '2024-08-10';

    component.addTournament();

    // Verify the POST request.
    const postReq = httpTestingController.expectOne(`${API_URL}/tournaments`);
    expect(postReq.request.body).toEqual({
      tournamentName: 'New Tournament',
      tournamentType: 'Knockout',
      startDate: '2024-08-01',
      endDate: '2024-08-10'
    });
    postReq.flush({
      TournamentUUID: 'new-uuid',
      TournamentName: 'New Tournament',
      TournamentType: 'Knockout',
      StartDate: '2024-08-01',
      EndDate: '2024-08-10'
    });

    // The service calls fetchTournaments after adding so expect a GET.
    const getReq = httpTestingController.expectOne(`${API_URL}/tournaments`);
    // Simulate that the new tournament is now in the list.
    getReq.flush([{
      TournamentUUID: 'new-uuid',
      TournamentName: 'New Tournament',
      TournamentType: 'Knockout',
      StartDate: '2024-08-01',
      EndDate: '2024-08-10'
    }]);

    // Use tick to ensure any pending microtasks (like setTimeout) are processed.
    tick(0);

    // Verify the form was reset.
    expect(component.tournamentForm.tournament.tournamentName).toBe('');
    expect(component.tournamentForm.tournament.tournamentType).toBe('Knockout');
    expect(component.tournamentForm.tournament.startDate).toBe('');
    expect(component.tournamentForm.tournament.endDate).toBe('');
    expect(component.tournamentForm.success).toBe('Torneig afegit correctament');
  }));

  it('should delete a tournament', () => {
    // Pre-populate tournaments.
    component.tournaments = [
      new Tournament('uuid1', 'Test Tournament', 'Knockout', '2024-06-01', '2024-06-10')
    ];
    fixture.detectChanges();

    const tournamentUUID = 'uuid1';
    
    component.deleteTournament(tournamentUUID);

    // Verify the DELETE request.
    const deleteReq = httpTestingController.expectOne(`${API_URL}/tournaments/${tournamentUUID}`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});

    // The service calls fetchTournaments after deletion, so expect a GET.
    const getReq = httpTestingController.expectOne(`${API_URL}/tournaments`);
    // Simulate that the tournament list is now empty.
    getReq.flush([]);

    // Verify that the UI no longer shows the deleted tournament.
    expect(component.tournaments.some(t => t.tournamentUUID === tournamentUUID)).toBeFalse();
  });

  it('should not add a tournament if name is missing', () => {
    component.tournamentForm.tournament.tournamentName = '';
    component.tournamentForm.tournament.startDate = '2024-08-01';

    component.addTournament();

    // Since the name is missing no HTTP call should be made.
    httpTestingController.expectNone(`${API_URL}/tournaments`);
    expect(component.tournamentForm.error).toBe('Error afegint torneig');
  });
});
