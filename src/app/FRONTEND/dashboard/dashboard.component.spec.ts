import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('DashboardComponent - TDD', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Com que DashboardComponent és standalone, l'importem directament
      imports: [DashboardComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display dashboard stats from the API', () => {
    // Dades simulades que ens retornarà l'API
    const mockStats = {
      totalTeams: 10,
      totalPlayers: 100,
      totalGoals: 50,
      totalMatches: 20
    };

    // Executem ngOnInit i, per tant, la petició HTTP
    fixture.detectChanges();

    // Comprovem que s'ha fet la petició GET a l'API
    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/dashboard');
    expect(req.request.method).toBe('GET');

    // Simulem la resposta del servidor
    req.flush(mockStats);

    // Actualitzem la vista amb les dades rebudes
    fixture.detectChanges();

    // Validem que l'HTML mostra les estadístiques correctes
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dashboard h2')?.textContent).toContain('Dashboard Global');
    expect(compiled.querySelector('.dashboard p:nth-of-type(1)')?.textContent).toContain('Total Equips: 10');
    expect(compiled.querySelector('.dashboard p:nth-of-type(2)')?.textContent).toContain('Total Jugadors: 100');
    expect(compiled.querySelector('.dashboard p:nth-of-type(3)')?.textContent).toContain('Total Gols en Partits: 50');
    expect(compiled.querySelector('.dashboard p:nth-of-type(4)')?.textContent).toContain('Total Partits Jugats: 20');
  });
});
