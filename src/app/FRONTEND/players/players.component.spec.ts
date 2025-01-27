import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlayersComponent } from './players.component';
import { HttpClientModule } from '@angular/common/http';

describe('PlayersComponent', () => {
  let component: PlayersComponent;
  let fixture: ComponentFixture<PlayersComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersComponent, HttpClientTestingModule], // Incloure HttpClientTestingModule
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayersComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);  // Injecció de HttpTestingController
    fixture.detectChanges();
  });

  // Test 1: Carregar jugadors en inicialitzar el component
  it('should fetch players on component initialization', () => {
    const mockPlayers = [
      { id: 1, name: 'Player 1', position: 'Goalkeeper', team: 'Team A' },
      { id: 2, name: 'Player 2', position: 'Defender', team: 'Team B' }
    ];

    const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
    expect(req.request.method).toBe('GET');
    req.flush(mockPlayers);

    fixture.detectChanges();

    expect(component.players).toEqual(mockPlayers);
  });

  it('should add a new player and reset the form', () => {
    const newPlayer = { name: 'Player 3', position: 'Midfielder', team: 'Team C' };
    component.newPlayer = newPlayer;
  
    const mockResponse = { id: 3, ...newPlayer };
  
    const req = httpMock.expectOne('http://localhost:3000/api/v1/players');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      playerName: newPlayer.name,
      position: newPlayer.position,
      teamID: newPlayer.team
    });
    req.flush(mockResponse);
  
    expect(component.players).toContain(mockResponse);
    expect(component.newPlayer).toEqual({ name: '', position: '', team: '' });
  });
  
});
