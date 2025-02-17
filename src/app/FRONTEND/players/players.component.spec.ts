import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlayersComponent } from './players.component';

describe('PlayersComponent', () => {
  let component: PlayersComponent;
  let fixture: ComponentFixture<PlayersComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayersComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('fetchPlayers', () => {
    it('hauria de carregar els jugadors correctament', () => {
      const mockPlayers = [
        { id: 1, name: 'Player 1', position: 'Defender', team: 'Team A' },
        { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' },
      ];

      component.fetchPlayers();
      const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
      expect(req.request.method).toBe('GET');
      req.flush(mockPlayers);
      expect(component.players).toEqual(mockPlayers);
    });

    it('hauria de mostrar un error si fetchPlayers falla', () => {
      spyOn(console, 'error');
      component.fetchPlayers();
      const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
      expect(console.error).toHaveBeenCalledWith('Error carregant els jugadors:', jasmine.anything());
    });
  });

  describe('addPlayer', () => {
    it('should add new player correctly', () => {
      // Simulem que hi ha equips disponibles
      component.teams = [{ TeamID: 1, TeamName: 'Team C' }];
      // Espiem el mètode fetchPlayers per comprovar que s'invoca després de l\'addició
      spyOn(component, 'fetchPlayers');

      component.newPlayer = {
        name: 'New Player',
        position: 'Midfielder',
        team: 'Team C',
        isActive: true,
        isForSale: false,
        price: 0,
        height: 0,
        speed: 0,
        shooting: 0
      };
      component.selectedFile = new File(['dummy content'], 'dummy.png', { type: 'image/png' });

      component.addPlayer();

      const reqPost = httpMock.expectOne('http://localhost:3000/api/v1/players');
      expect(reqPost.request.method).toBe('POST');
      reqPost.flush({});

      expect(component.fetchPlayers).toHaveBeenCalled();
      // Comprovem que s'ha resetejat el formulari correctament
      expect(component.newPlayer).toEqual({
        name: '',
        position: '',
        team: '',
        isActive: true,
        isForSale: false,
        price: 0,
        height: 0,
        speed: 0,
        shooting: 0
      });
      expect(component.selectedFile).toBeNull();
    });

    it('no hauria d’afegir un jugador si falten dades', () => {
      // Comprovem que si falten dades es mostra l\'alerta i no es fa cap crida HTTP.
      component.teams = [{ TeamID: 1, TeamName: 'Team A' }]; // Equip disponible
      component.newPlayer = {
        name: '',
        position: '',
        team: '',
        isActive: true,
        isForSale: false,
        price: 0,
        height: 0,
        speed: 0,
        shooting: 0
      };

      spyOn(window, 'alert');
      component.addPlayer();

      httpMock.expectNone('http://localhost:3000/api/v1/players');
      expect(window.alert).toHaveBeenCalledWith('Tots els camps són obligatoris, incloent la imatge.');
    });

    it('should show an error if addPlayer fails', () => {
      // Simulem que hi ha equips disponibles
      component.teams = [{ TeamID: 1, TeamName: 'Team C' }];
      spyOn(console, 'error');

      component.newPlayer = {
        name: 'New Player',
        position: 'Midfielder',
        team: 'Team C',
        isActive: true,
        isForSale: false,
        price: 0,
        height: 0,
        speed: 0,
        shooting: 0
      };
      component.selectedFile = new File(['dummy content'], 'dummy.png', { type: 'image/png' });

      component.addPlayer();

      const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

      expect(console.error).toHaveBeenCalledWith('Error afegint el jugador:', jasmine.anything());
    });

    it('shouldn’t add new player if no teams are available', () => {
      // Forcem la situació en què no hi ha equips disponibles
      component.teams = [];
      component.newPlayer = {
        name: 'New Player',
        position: 'Midfielder',
        team: '1',
        isActive: true,
        isForSale: false,
        price: 0,
        height: 0,
        speed: 0,
        shooting: 0
      };
      const httpSpy = spyOn(component['http'], 'post').and.callThrough();
      spyOn(window, 'alert');

      component.addPlayer();

      // No s'ha de fer cap petició HTTP perquè no hi ha equips
      expect(httpSpy).not.toHaveBeenCalled();
      httpMock.expectNone('http://localhost:3000/api/v1/players');
    });
  });

  describe('deletePlayer', () => {
    it('hauria d’eliminar un jugador correctament', () => {
      const mockPlayers = [
        { id: 1, name: 'Player 1', position: 'Defender', team: 'Team A' },
        { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' },
      ];
      const mockTeams = [
        { TeamID: 1, TeamName: 'Team A' },
        { TeamID: 2, TeamName: 'Team B' },
      ];

      // Invoquem ngOnInit per carregar jugadors i equips
      component.ngOnInit();

      const playersReq = httpMock.expectOne('http://localhost:3000/api/v1/players');
      playersReq.flush(mockPlayers);
      const teamsReq = httpMock.expectOne('http://localhost:3000/api/v1/teams');
      teamsReq.flush(mockTeams);

      expect(component.players).toEqual(mockPlayers);
      expect(component.teams).toEqual(mockTeams);

      spyOn(component, 'fetchPlayers');
      const playerId = 1;
      component.deletePlayer(playerId);

      const deleteReq = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      expect(component.fetchPlayers).toHaveBeenCalled();
    });

    it('hauria de mostrar un error si deletePlayer falla', () => {
      spyOn(console, 'error');
      const playerId = 1;
      component.deletePlayer(playerId);

      const req = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

      expect(console.error).toHaveBeenCalledWith('Error eliminant el jugador:', jasmine.anything());
    });
  });

  describe('fetchTeams', () => {
    it('should load the teams correctly with fetchTeams', () => {
      const mockTeams = [
        { TeamID: 1, TeamName: 'Team A' },
        { TeamID: 2, TeamName: 'Team B' },
      ];

      component.fetchTeams();
      const req = httpMock.expectOne('http://localhost:3000/api/v1/teams');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeams);

      expect(component.teams).toEqual(mockTeams);
    });

    it('should show an error if fetchTeams fails', () => {
      spyOn(console, 'error');

      component.fetchTeams();

      const req = httpMock.expectOne('http://localhost:3000/api/v1/teams');
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });

      expect(console.error).toHaveBeenCalledWith('Error carregant els equips:', jasmine.anything());
    });

    it('should load the players and teams during ngOnInit', () => {
      spyOn(component, 'fetchPlayers');
      spyOn(component, 'fetchTeams');

      component.ngOnInit();

      expect(component.fetchPlayers).toHaveBeenCalled();
      expect(component.fetchTeams).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});