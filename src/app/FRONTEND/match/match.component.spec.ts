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
  
});
