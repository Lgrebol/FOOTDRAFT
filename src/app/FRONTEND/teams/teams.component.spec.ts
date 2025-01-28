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
 
  it('should load the teams correctly', () => {
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

  it('should load the users correctly', () => {
    const mockUsers = [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
    ];
  
    // Component initialization (ngOnInit) triggers fetchUsers()
    fixture.detectChanges(); // Ensure ngOnInit is called if not already
  
    // Verify the API request
    const req = httpMock.expectOne('http://localhost:3000/api/v1/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers); // Simulate response
  
    // Check users assignment
    expect(component.users).toEqual(mockUsers);
  });
  
  it('should add a new team when the data is valid', () => {
    // Trigger component initialization (if not already done in beforeEach)
    fixture.detectChanges();
  
    // Handle the initial GET request from ngOnInit (if applicable)
    const getReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    expect(getReq.request.method).toBe('GET');
    getReq.flush([]); // Flush mock response for GET
  
    // Set up test data
    (component.newTeam as any) = { name: 'New Team', shirtColor: 'Green', userId: 1 };
    spyOn(component, 'fetchTeams');
  
    // Trigger addTeam
    component.addTeam();
  
    // Expect a POST request with specific URL and method
    const postReq = httpMock.expectOne({
      url: 'http://localhost:3000/api/v1/teams',
      method: 'POST'
    });
    
    // Verify POST request details
    expect(postReq.request.body).toEqual({
      teamName: 'New Team',
      shirtColor: 'Green',
      userID: 1
    });
    postReq.flush({}); // Simulate successful response
  
    // Verify fetchTeams is called to refresh the list
    expect(component.fetchTeams).toHaveBeenCalled();
  });
  
  it('should not add a team if data is missing ', () => {
    // Handle initial GET requests from ngOnInit
    const getTeamsReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    getTeamsReq.flush([]); // Mock empty response
    const getUsersReq = httpMock.expectOne('http://localhost:3000/api/v1/users');
    getUsersReq.flush([]);
  
    // Set invalid team data
    component.newTeam = { name: '', shirtColor: '', userId: null };
    spyOn(component, 'fetchTeams');
  
    component.addTeam();
  
    // Verify no POST request is made
    httpMock.expectNone({
      url: 'http://localhost:3000/api/v1/teams',
      method: 'POST'
    });
  
    // Ensure fetchTeams wasn't called
    expect(component.fetchTeams).not.toHaveBeenCalled();
  });
  
});
