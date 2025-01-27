import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlayersComponent } from './players.component';

describe('PlayersComponent', () => {
  let component: PlayersComponent;
  let fixture: ComponentFixture<PlayersComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersComponent, HttpClientTestingModule] // Incloure HttpClientTestingModule
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayersComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);  // Injecció de HttpTestingController
    fixture.detectChanges();
  });

  it('should fetch players', () => {
    const mockPlayers = [
      { PlayerID: 1, PlayerName: 'Player 1', Position: 'Forward', Points: 10, TeamName: 'Team A' },
      { PlayerID: 2, PlayerName: 'Player 2', Position: 'Midfielder', Points: 15, TeamName: 'Team B' }
    ];

    const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
    req.flush(mockPlayers);

    expect(component.players.length).toBe(2);
    expect(component.players[0].PlayerName).toBe('Player 1');
    expect(component.players[1].PlayerName).toBe('Player 2');
  });

  afterEach(() => {
    httpMock.verify();  // Verifica que no quedi cap petició pendent
  });
});
