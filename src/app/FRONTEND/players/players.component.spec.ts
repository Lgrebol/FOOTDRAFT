import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlayersComponent } from './players.component';

describe('PlayersComponent', () => {
  let component: PlayersComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlayersComponent, // Importa el component standalone
        HttpClientTestingModule, // Importa els mòduls necessaris
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PlayersComponent);
    component = fixture.componentInstance;
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
  });

  it('hauria de mostrar un error si fetchPlayers falla', () => {
    spyOn(console, 'error');
    component.fetchPlayers();


    const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
    req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });


    expect(console.error).toHaveBeenCalledWith('Error carregant els jugadors:', jasmine.anything());
  });

  describe('addPlayer', () => {
    it('hauria d’afegir un jugador correctament', () => {
      const mockPlayers = [
        { id: 1, name: 'Player 1', position: 'Defender', team: 'Team A' },
        { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' },
      ];

      spyOn(component, 'fetchPlayers').and.callFake(() => {
        component.players = mockPlayers; // Simulem que els jugadors ja estan carregats
      });

      component.newPlayer = { name: 'New Player', position: 'Midfielder', team: 'Team C' };

      component.addPlayer();

      const reqPost = httpMock.expectOne('http://localhost:3000/api/v1/players');
      expect(reqPost.request.method).toBe('POST');
      expect(reqPost.request.body).toEqual({
        playerName: 'New Player',
        position: 'Midfielder',
        teamID: 'Team C',
      });

      reqPost.flush({}); // Simula una resposta exitosa

      expect(component.newPlayer).toEqual({ name: '', position: '', team: '' });
    });

    it('no hauria d’afegir un jugador si falten dades', () => {
      component.newPlayer = { name: '', position: '', team: '' };

      component.addPlayer();

      httpMock.expectNone('http://localhost:3000/api/v1/players'); // Assegura que no es faci cap crida
    });

    it('hauria de mostrar un error si addPlayer falla', () => {
      spyOn(console, 'error');
      component.newPlayer = { name: 'New Player', position: 'Midfielder', team: 'Team C' };


      component.addPlayer();


      const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });


      expect(console.error).toHaveBeenCalledWith('Error afegint el jugador:', jasmine.anything());
    });
  });

  describe('deletePlayer', () => {
    it('hauria d’eliminar un jugador correctament', () => {
      const mockPlayers = [
        { id: 1, name: 'Player 1', position: 'Defender', team: 'Team A' },
        { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' },
      ];
   
      component.fetchPlayers(); // Carregar jugadors inicialment
      const fetchReq = httpMock.expectOne('http://localhost:3000/api/v1/players');
      fetchReq.flush(mockPlayers); // Simulant resposta dels jugadors
   
      const playerId = 1;
      component.deletePlayer(playerId); // Eliminar un jugador
   
      // Comprova la crida DELETE
      const deleteReq = httpMock.expectOne(`http://localhost:3000/api/v1/players/${playerId}`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({}); // Simula una resposta exitosa de l'eliminació
   
      // Comprova la llista de jugadors després de l'eliminació
      expect(component.players).toEqual([
        { id: 2, name: 'Player 2', position: 'Forward', team: 'Team B' }
      ]);
   
      // Comprova que no hi ha més peticions pendents després de l'eliminació
      httpMock.verify();
    });  
  });
});