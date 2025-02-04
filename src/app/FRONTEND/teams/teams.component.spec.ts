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

  it('should show an error if addTeam doesn\'t work', () => {
    spyOn(console, 'error'); // Spy on console.error
  
    // Handle the initial GET request (if component fetches data on init)
    const initialGetReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    initialGetReq.flush([]); // Flush with empty array or mock data
  
    // Set up the new team data
    (component.newTeam as any) = { name: 'New Team', shirtColor: 'Green', userId: 1 };
  
    // Trigger the addTeam method
    component.addTeam();
  
    // Expect and handle the POST request
    const postReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    postReq.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
  
    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith('Error afegint l\'equip:', jasmine.anything());
  });

  it('should show an error if addTeam dosen\'t work', () => {
    spyOn(console, 'error');
  
    // Primer gestionem la petició GET inicial que es fa en ngOnInit
    const initialGetReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    initialGetReq.flush([]); // Flush de la resposta buida o dades mock
  
    // Configurar newTeam
    (component.newTeam as any) = { name: 'New Team', shirtColor: 'Green', userId: 1 };
  
    // Executar addTeam
    component.addTeam();
  
    // Capturar la petició POST
    const postReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
    postReq.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
  
    // Verificar que es mostra l'error
    expect(console.error).toHaveBeenCalledWith('Error afegint l\'equip:', jasmine.anything());
  }); 
  
  it('it should delete teams correclty', () => {
    const teamId = 1;
    spyOn(component, 'fetchTeams'); // Espiem la crida a fetchTeams
  
    component.deleteTeam(teamId);
  
    const req = httpMock.expectOne(`http://localhost:3000/api/v1/teams/${teamId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}); // Simulem una resposta exitosa
  
    // Comprovem que fetchTeams ha estat cridat per actualitzar la llista
    expect(component.fetchTeams).toHaveBeenCalled();
  });
  
  it('should show an error if deleteTeam dosen\'t work', () => {
    spyOn(console, 'error'); // Espiem els errors a la consola
  
    const teamId = 1;
    component.deleteTeam(teamId);
  
    const req = httpMock.expectOne(`http://localhost:3000/api/v1/teams/${teamId}`);
    req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
  
    expect(console.error).toHaveBeenCalledWith('Error eliminant l\'equip:', jasmine.anything());
  });  

  it('should load reserved players correctly', () => {
    const mockReservedPlayers = [
      { id: 1, name: 'Jugador A' },
      { id: 2, name: 'Jugador B' },
    ];
  
    // Handle the initial reserved players request from ngOnInit
    const initialReq = httpMock.expectOne(`http://localhost:3000/api/v1/reserve/${component.currentUserID}`);
    initialReq.flush([]); // Flush initial request (optional mock data)
  
    // Trigger fetchReservedPlayers again
    component.fetchReservedPlayers();
  
    // Handle the second request triggered by the test
    const req = httpMock.expectOne(`http://localhost:3000/api/v1/reserve/${component.currentUserID}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReservedPlayers);
  
    fixture.detectChanges();
  
    expect(component.reservedPlayers).toEqual(mockReservedPlayers);
  });

  it('should show an error if fetchReservedPlayers fails', () => {
    spyOn(console, 'error');
  
    // Handle the initial reserved players request from ngOnInit
    const initialReq = httpMock.expectOne(`http://localhost:3000/api/v1/reserve/${component.currentUserID}`);
    initialReq.flush([]);
  
    // Trigger fetchReservedPlayers again
    component.fetchReservedPlayers();
  
    // Handle the second request and simulate an error
    const req = httpMock.expectOne(`http://localhost:3000/api/v1/reserve/${component.currentUserID}`);
    req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
  
    expect(console.error).toHaveBeenCalledWith('Error carregant les reserves:', jasmine.anything());
  });

  it('should assign a reserved player to a team correctly', () => {
    // Configurem un espia per a l'alerta i per a fetchReservedPlayers (ja que s'ha de cridar després de l'assignació)
    spyOn(window, 'alert');
    spyOn(component, 'fetchReservedPlayers');
  
    // Configurar dades vàlides per a l'assignació
    component.selectedTeamId = 5;
    component.selectedPlayerId = 10;
  
    // Cridem el mètode d'assignació
    component.assignPlayerToTeam();
  
    // Esperem la petició POST a la URL amb l'id de l'equip seleccionat
    const req = httpMock.expectOne(`http://localhost:3000/api/v1/teams/5/add-player-from-reserve`);
    expect(req.request.method).toBe('POST');
  
    // Comprovem que el body de la petició conté les dades correctes
    expect(req.request.body).toEqual({
      playerId: 10,
      userID: component.currentUserID,
    });
  
    // Simulem una resposta satisfactòria amb un missatge
    req.flush({ message: 'Jugador assignat correctament' });
  
    // Opcional: forcem la detecció de canvis
    fixture.detectChanges();
  
    // Verifiquem que s'ha mostrat l'alerta amb el missatge
    expect(window.alert).toHaveBeenCalledWith('Jugador assignat correctament');
  
    // Verifiquem que es crida a fetchReservedPlayers per actualitzar la llista
    expect(component.fetchReservedPlayers).toHaveBeenCalled();
  
    // Verifiquem que les seleccions es reinicien
    expect(component.selectedTeamId).toBeNull();
    expect(component.selectedPlayerId).toBeNull();
  });
  
});
