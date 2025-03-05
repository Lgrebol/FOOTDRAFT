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

    // La petició GET inicial del servei per carregar els tornejos
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
    // Creem dues instàncies de Tournament assignant les propietats amb els setters
    const mockTournament1 = new Tournament();
    mockTournament1.tournamentUUID = 'uuid1';
    mockTournament1.tournamentName = 'Test1';
    mockTournament1.tournamentType = 'Knockout';
    mockTournament1.startDate = '2024-06-01';
    mockTournament1.endDate = '2024-06-10';

    const mockTournament2 = new Tournament();
    mockTournament2.tournamentUUID = 'uuid2';
    mockTournament2.tournamentName = 'Test2';
    mockTournament2.tournamentType = 'League';
    mockTournament2.startDate = '2024-07-01';
    mockTournament2.endDate = '2024-07-15';

    // Simulem una nova actualització en el servei (per exemple, via un BehaviorSubject)
    (component['tournamentService'] as any).tournamentsSubject.next([mockTournament1, mockTournament2]);
    fixture.detectChanges();

    expect(component.tournaments).toEqual([mockTournament1, mockTournament2]);
  });

  it('should add a tournament and reset the form', fakeAsync(() => {
    // Assignem valors al formulari
    component.tournamentForm.tournament.tournamentName = 'New Tournament';
    component.tournamentForm.tournament.tournamentType = 'Knockout';
    component.tournamentForm.tournament.startDate = '2024-08-01';
    component.tournamentForm.tournament.endDate = '2024-08-10';

    component.addTournament();

    // Verifiquem la petició POST
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

    // El servei torna a carregar els tornejos després d'afegir, per tant s'espera una petició GET
    const getReq = httpTestingController.expectOne(`${API_URL}/tournaments`);
    // Simulem que la nova llista inclou el torneig afegit
    getReq.flush([{
      TournamentUUID: 'new-uuid',
      TournamentName: 'New Tournament',
      TournamentType: 'Knockout',
      StartDate: '2024-08-01',
      EndDate: '2024-08-10'
    }]);

    tick(0);
    fixture.detectChanges();

    // Comprovem que el formulari s'ha reinicialitzat
    expect(component.tournamentForm.tournament.tournamentName).toBe('');
    expect(component.tournamentForm.tournament.tournamentType).toBe('Knockout');
    expect(component.tournamentForm.tournament.startDate).toBe('');
    expect(component.tournamentForm.tournament.endDate).toBe('');
    expect(component.tournamentForm.success).toBe('Torneig afegit correctament');
  }));

  it('should delete a tournament', () => {
    // Pre-populem el component amb un torneig
    const tournament = new Tournament();
    tournament.tournamentUUID = 'uuid1';
    tournament.tournamentName = 'Test Tournament';
    tournament.tournamentType = 'Knockout';
    tournament.startDate = '2024-06-01';
    tournament.endDate = '2024-06-10';
    component.tournaments = [tournament];
    fixture.detectChanges();

    const tournamentUUID = 'uuid1';
    
    component.deleteTournament(tournamentUUID);

    // Verifiquem la petició DELETE
    const deleteReq = httpTestingController.expectOne(`${API_URL}/tournaments/${tournamentUUID}`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});

    // Després s'actualitza la llista via GET
    const getReq = httpTestingController.expectOne(`${API_URL}/tournaments`);
    // Simulem que la llista és ara buida
    getReq.flush([]);

    expect(component.tournaments.some(t => t.tournamentUUID === tournamentUUID)).toBeFalse();
  });

  it('should not add a tournament if name is missing', () => {
    component.tournamentForm.tournament.tournamentName = '';
    component.tournamentForm.tournament.startDate = '2024-08-01';

    component.addTournament();

    // Com que el nom està buit, no s'ha de fer cap POST
    httpTestingController.expectNone(`${API_URL}/tournaments`);
    expect(component.tournamentForm.error).toBe('Error afegint torneig');
  });
});
