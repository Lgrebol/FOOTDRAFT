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
});