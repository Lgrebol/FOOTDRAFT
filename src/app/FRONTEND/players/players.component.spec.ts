import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersComponent } from './players.component';

describe('PlayersComponent', () => {
  let component: PlayersComponent;
  let fixture: ComponentFixture<PlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch players', () => {
    const mockPlayers = [
      { PlayerID: 1, PlayerName: 'Player 1', Position: 'Forward', Points: 10, TeamName: 'Team A' },
      { PlayerID: 2, PlayerName: 'Player 2', Position: 'Midfielder', Points: 15, TeamName: 'Team B' }
    ];
  
    // Actua com una resposta d'API
    const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
    req.flush(mockPlayers);
  
    // Comprova que la llista de jugadors es carrega correctament
    expect(component.players.length).toBe(2);
    expect(component.players[0].PlayerName).toBe('Player 1');
    expect(component.players[1].PlayerName).toBe('Player 2');
  });
  
});
