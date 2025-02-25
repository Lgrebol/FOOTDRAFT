import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from '../Components/dashboard/dashboard.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from '../Serveis/dashboard.service';
import { By } from '@angular/platform-browser';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpTestingController: HttpTestingController;
  let dashboardService: DashboardService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent, 
        HttpClientTestingModule
      ],
      providers: [DashboardService]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    dashboardService = TestBed.inject(DashboardService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create component correctly', fakeAsync(() => {
    fixture.detectChanges();
    
    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/dashboard');
    req.flush({}); 
    
    tick();
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  }));

  it('should display loading state initially', fakeAsync(() => {
    fixture.detectChanges();
    
    const loadingEl = fixture.debugElement.query(By.css('.loading'));
    expect(loadingEl).toBeTruthy();
  
    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/dashboard');
    req.flush({});
    
    tick();
    fixture.detectChanges();
  }));

  it('should display error state when API fails', fakeAsync(() => {
    fixture.detectChanges();
    
    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/dashboard');
    req.flush(null, { status: 500, statusText: 'Server Error' });
    
    tick();
    fixture.detectChanges();
    
    const errorEl = fixture.debugElement.query(By.css('.error'));
    expect(errorEl.nativeElement.textContent).toContain('Error obtenint estadístiques');
  }));

  it('should display stats correctly after successful API response', fakeAsync(() => {
    const mockApiResponse = {
      totalTeams: 15,
      totalPlayers: 120,
      totalTournaments: 8,
      totalGoals: 75,
      totalMatches: 32
    };

    fixture.detectChanges();
    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/dashboard');
    req.flush(mockApiResponse);

    tick();
    fixture.detectChanges();

    // Cerquem el contenidor principal de les estadístiques
    const statsContainer = fixture.debugElement.query(By.css('.football-field'));
    const statsCards = statsContainer.queryAll(By.css('.stat-card'));
    
    // Comprovem cada targeta (assegura't de mantenir l'ordre definit a la plantilla)
    expect(statsCards[0].nativeElement.textContent).toContain('Equips');
    expect(statsCards[0].nativeElement.textContent).toContain('15');

    expect(statsCards[1].nativeElement.textContent).toContain('Jugadors');
    expect(statsCards[1].nativeElement.textContent).toContain('120');

    expect(statsCards[2].nativeElement.textContent).toContain('Torneigs');
    expect(statsCards[2].nativeElement.textContent).toContain('8');

    expect(statsCards[3].nativeElement.textContent).toContain('Gols');
    expect(statsCards[3].nativeElement.textContent).toContain('75');

    expect(statsCards[4].nativeElement.textContent).toContain('Partits');
    expect(statsCards[4].nativeElement.textContent).toContain('32');
  }));

  it('should handle unexpected API response format', fakeAsync(() => {
    fixture.detectChanges();
    
    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/dashboard');
    req.flush({ invalidData: true }); // Resposta amb format incorrecte
    
    tick();
    fixture.detectChanges();

    const statsContainer = fixture.debugElement.query(By.css('.football-field'));
    const statsCards = statsContainer.queryAll(By.css('.stat-card'));
    
    // Verifiquem que, en absència de dades vàlides, es mantinguin els valors per defecte (0)
    expect(statsCards[0].nativeElement.textContent).toContain('Equips');
    expect(statsCards[0].nativeElement.textContent).toContain('0');

    expect(statsCards[1].nativeElement.textContent).toContain('Jugadors');
    expect(statsCards[1].nativeElement.textContent).toContain('0');
  }));
});
