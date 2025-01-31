import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentComponent } from './tournament.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('TournamentComponent', () => {
  let component: TournamentComponent;
  let fixture: ComponentFixture<TournamentComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, TournamentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);

    // Trigger ngOnInit and handle initial GET request
    fixture.detectChanges();
    const initialReq = httpTestingController.expectOne(`${component.API_URL}/tournaments`);
    initialReq.flush([]); // Flush empty array or mock data
  });

  afterEach(() => {
    httpTestingController.verify(); // Verify no outstanding requests
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load tournaments', () => {
    const mockTournaments = [
      { TournamentID: 1, TournamentName: 'Test1', TournamentType: 'Knockout', StartDate: '2024-06-01', EndDate: '2024-06-10' },
      { TournamentID: 2, TournamentName: 'Test2', TournamentType: 'League', StartDate: '2024-07-01', EndDate: '2024-07-15' }
    ];

    component.loadTournaments();

    // Handle the GET request triggered by loadTournaments()
    const req = httpTestingController.expectOne(`${component.API_URL}/tournaments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTournaments);

    expect(component.tournaments).toEqual(mockTournaments);
  });
});