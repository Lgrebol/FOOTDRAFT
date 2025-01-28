import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'; // Per simular les peticions HTTP
import { TeamsComponent } from './teams.component'; // El component que estem testant
import { HttpClientModule } from '@angular/common/http'; // Necessari per les crides HTTP
import { CommonModule } from '@angular/common'; // Necessari per importar el mòdul CommonModule
import { FormsModule } from '@angular/forms'; // Necessari per suportar formularis si en fem ús

describe('TeamsComponent', () => {
  let component: TeamsComponent;
  let fixture: ComponentFixture<TeamsComponent>;
  let httpMock: HttpTestingController; // Controlador per simular les crides HTTP

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsComponent, HttpClientTestingModule] // Afegim el mòdul de simulació HTTP
    }).compileComponents();
  
    fixture = TestBed.createComponent(TeamsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController); // Agafem el controlador per simular les crides HTTP
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hauria de carregar els equips correctament', () => {
    const mockTeams = [
      { id: 1, name: 'Team A', shirtColor: 'Red', userId: 1 },
      { id: 2, name: 'Team B', shirtColor: 'Blue', userId: 2 },
    ];
  
    // Expect and handle the initial teams request
    const teamsReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    expect(teamsReq.request.method).toBe('GET');
    teamsReq.flush(mockTeams);
  
    // Expect and handle the initial users request to prevent errors
    const usersReq = httpMock.expectOne('http://localhost:3000/api/v1/users');
    usersReq.flush([]); // You can add mock users here if needed
  
    // Trigger change detection to update the component with the mock data
    fixture.detectChanges();
  
    // Verify the component's teams are set correctly
    expect(component.teams).toEqual(mockTeams);
  });
  
});
