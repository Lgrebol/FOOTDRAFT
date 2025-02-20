import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Updated interfaces with proper (camelCase) property names
export interface Team {
  id: number;
  teamName: string;
  shirtColor: string;
  userID: number;
  username?: string;  // Optional: if your backend sends the team owner’s username
}

export interface Player {
  id: number;
  playerName: string;
  position: string;
  teamID: number;
  isActive: boolean;
  isForSale: boolean;
  price: number;
  height: number;
  speed: number;
  shooting: number;
  imageUrl?: string;
  points?: number;
  teamName?: string; // Optional: if your backend sends the name of the team the player belongs to
}

export interface Tournament {
  id: number;
  tournamentName: string;
  tournamentType: string;
  startDate: string;
  endDate: string;
}

export interface DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  totalTournaments: number;
  totalGoals: number;
  totalMatches: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  footcoins: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api/v1';
  
  // BehaviorSubjects for real-time data updates with strong types
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  private playersSubject = new BehaviorSubject<Player[]>([]);
  private tournamentsSubject = new BehaviorSubject<Tournament[]>([]);
  private storePlayersSubject = new BehaviorSubject<Player[]>([]);
  private reservedPlayersSubject = new BehaviorSubject<Player[]>([]);
  private usersSubject = new BehaviorSubject<User[]>([]);
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private footcoinsSubject = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    this.refreshAllData();
  }

  // Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Method to refresh all data
  refreshAllData(): void {
    this.fetchTeams();
    this.fetchPlayers();
    this.fetchTournaments();
    this.fetchStorePlayers();
    this.fetchUsers();
  }

  // Teams methods
  private fetchTeams(): void {
    this.http.get<Team[]>(`${this.apiUrl}/teams`).subscribe(
      teams => this.teamsSubject.next(teams),
      error => console.error('Error fetching teams:', error)
    );
  }

  getTeams(): Observable<Team[]> {
    return this.http.get<any[]>(`${this.apiUrl}/teams`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(teams => teams.map(t => ({
        id: t.TeamID,       
        teamName: t.TeamName,  
        shirtColor: t.ShirtColor, 
        userID: t.UserID,  
        username: t.UserName  
      })))
    );
  }
  

  addTeam(teamData: { teamName: string; shirtColor: string; userID: number }): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/teams`, teamData).pipe(
      tap(() => this.fetchTeams())
    );
  }

  deleteTeam(teamId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${teamId}`).pipe(
      tap(() => this.fetchTeams())
    );
  }

  // Players methods
  private fetchPlayers(): void {
    this.http.get<Player[]>(`${this.apiUrl}/players`).subscribe(
      players => this.playersSubject.next(players),
      error => console.error('Error fetching players:', error)
    );
  }

  getPlayers(): Observable<Player[]> {
    return this.http.get<any[]>(`${this.apiUrl}/players`).pipe(
      map(players => players.map(p => ({
        id: p.PlayerID,          
        playerName: p.PlayerName,    
        position: p.Position,       
        teamID: p.TeamID,            
        isActive: p.IsActive,        
        isForSale: p.IsForSale,    
        price: p.Price,            
        height: p.Height,    
        speed: p.Speed,   
        shooting: p.Shooting,   
        imageUrl: p.PlayerImage, 
        teamName: p.TeamName      
      })))
    );
  }
  
  addPlayer(playerData: FormData): Observable<Player> {
    return this.http.post<Player>(`${this.apiUrl}/players`, playerData).pipe(
      tap(() => this.fetchPlayers())
    );
  }

  deletePlayer(playerId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/players/${playerId}`).pipe(
      tap(() => this.fetchPlayers())
    );
  }

  // Store players methods
  private fetchStorePlayers(params?: HttpParams): void {
    this.http.get<any[]>(`${this.apiUrl}/players/store`, { params }).pipe(
      map(players => players.map(p => ({
        id: p.PlayerID,
        playerName: p.PlayerName,
        position: p.Position,
        teamID: p.TeamID,
        isActive: p.IsActive,
        isForSale: p.IsForSale,
        price: p.Price,
        height: p.Height,
        speed: p.Speed,
        shooting: p.Shooting,
        imageUrl: p.PlayerImage,  // Suposant que és la imatge
        teamName: p.TeamName     // Si es fa join amb el nom de l'equip
      })))
    ).subscribe(
      mappedPlayers => this.storePlayersSubject.next(mappedPlayers),
      error => console.error('Error fetching store players:', error)
    );
  }
  

  getStorePlayers(): Observable<Player[]> {
    return this.storePlayersSubject.asObservable();
  }

  refreshStorePlayers(searchTerm?: string, minPrice?: number, maxPrice?: number): void {
    let params = new HttpParams();
    if (searchTerm) params = params.set('search', searchTerm);
    if (minPrice) params = params.set('minPrice', minPrice.toString());
    if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
    this.fetchStorePlayers(params);
  }

  buyPlayer(playerId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/players/buy/${playerId}`, { userID: userId }).pipe(
      tap(() => {
        this.fetchStorePlayers();
        this.fetchReservedPlayers(userId);
      })
    );
  }

  // Reserved players methods
  private fetchReservedPlayers(userId: number): void {
    this.http.get<any[]>(`${this.apiUrl}/reserve/${userId}`).pipe(
      map(players => players.map(p => ({
        id: p.PlayerID,
        playerName: p.PlayerName,
        position: p.Position,
        teamID: p.TeamID,
        isActive: p.IsActive,
        isForSale: p.IsForSale,
        price: p.Price,
        height: p.Height,
        speed: p.Speed,
        shooting: p.Shooting,
        imageUrl: p.PlayerImage,
        teamName: p.TeamName  // Si s'envia des del backend
      })))
    ).subscribe(
      mappedPlayers => this.reservedPlayersSubject.next(mappedPlayers),
      error => console.error('Error fetching reserved players:', error)
    );
  }
  

  getReservedPlayers(userId: number): Observable<Player[]> {
    this.fetchReservedPlayers(userId);
    return this.reservedPlayersSubject.asObservable();
  }

  assignPlayerToTeam(teamId: number, playerId: number, userId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/teams/${teamId}/add-player-from-reserve`,
      { playerId, userID: userId }
    ).pipe(
      tap(() => {
        this.fetchTeams();
        this.fetchReservedPlayers(userId);
      })
    );
  }

  // Tournaments methods
  private fetchTournaments(): void {
    this.http.get<Tournament[]>(`${this.apiUrl}/tournaments`).subscribe(
      tournaments => this.tournamentsSubject.next(tournaments),
      error => console.error('Error fetching tournaments:', error)
    );
  }

  getTournaments(): Observable<Tournament[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tournaments`).pipe(
      map(tournaments => tournaments.map(t => ({
        id: t.TournamentID, 
        tournamentName: t.TournamentName, 
        tournamentType: t.TournamentType, 
        startDate: t.StartDate,         
        endDate: t.EndDate       
      })))
    );
  }
  

  addTournament(tournamentData: { tournamentName: string; tournamentType: string; startDate: string; endDate: string }): Observable<Tournament> {
    return this.http.post<Tournament>(`${this.apiUrl}/tournaments`, tournamentData).pipe(
      tap(() => this.fetchTournaments())
    );
  }

  deleteTournament(tournamentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tournaments/${tournamentId}`).pipe(
      tap(() => this.fetchTournaments())
    );
  }

  // Users methods
  private fetchUsers(): void {
    this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map(users => users.map(u => ({
        id: u.UserID,
        username: u.UserName,
        email: u.Email,
        footcoins: u.Footcoins
      })))
    ).subscribe(
      mappedUsers => this.usersSubject.next(mappedUsers),
      error => console.error('Error fetching users:', error)
    );
  }
  
  getUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }
  

  // Match methods
  createMatch(matchData: { tournamentID: number; homeTeamID: number; awayTeamID: number; matchDate: Date }): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches`, matchData);
  }

// Modificar el mètode getMatch i afegir getTeamName
getMatch(matchId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/matches/${matchId}`).pipe(
    map((response: any) => {
      const backendData = response.match;
      console.log('Dades rebudes del backend:', backendData); // Per depurar

      if (!backendData) return null;

      // Transformar dades del partit
      const transformedMatch = {
        id: backendData.MatchID,
        homeTeamID: backendData.HomeTeamID,
        awayTeamID: backendData.AwayTeamID,
        homeGoals: backendData.HomeGoals,
        awayGoals: backendData.AwayGoals,
        currentMinute: backendData.CurrentMinute,
        tournamentID: backendData.TournamentID,
        matchDate: backendData.MatchDate,
        events: []
      };

      // Transformar esdeveniments
      if (backendData.events && Array.isArray(backendData.events)) {
        transformedMatch.events = backendData.events.map((event: any) => ({
          minute: event.Minute,
          eventType: event.EventType,
          description: event.Description,
          team: event.Team 
        }));
      }

      console.log('Dades transformades:', transformedMatch); // Per depurar
      return transformedMatch;
    })
  );
}

// Afegir nou mètode per obtenir nom equip
getTeamName(teamId: number): Observable<string> {
  return this.getTeams().pipe(
    map(teams => {
      const team = teams.find(t => t.id === teamId);
      return team ? team.teamName : 'Equip Desconegut';
    })
  );
}

  simulateMatch(matchId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches/simulate`, { matchID: matchId });
  }
  
  resetMatch(matchId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches/reset`, { matchID: matchId });
  }  

  // Betting methods
  placeBet(betData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bets`, betData, {
      headers: this.getAuthHeaders()
    });
  }

  // Dashboard methods
  private fetchDashboardStats(): void {
    this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`).subscribe(
      data => this.dashboardStatsSubject.next(data),
      error => console.error('Error fetching dashboard stats:', error)
    );
  }
  
  getDashboardStats(): Observable<DashboardStats | null> {
    this.fetchDashboardStats();
    return this.dashboardStatsSubject.asObservable();
  }
  
  // Authentication methods
  loginUser(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/users/login`, 
      { email, password }
    );
  }

  registerUser(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, { 
      name: username, 
      email, 
      password 
    });
  }
    
  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }
  
  getFootcoinsUpdates(): Observable<number | undefined> {
    return this.currentUserSubject.asObservable().pipe(
      map(user => user?.footcoins)
    );
  }

  refreshCurrentUserData(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/auth/current-user`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(userData => {
        const currentUser: User = {
          id: userData.UserID,
          username: userData.Name,
          email: userData.Email,
          footcoins: userData.Footcoins
        };
        console.log('Dades usuari rebudes:', currentUser);
        this.currentUserSubject.next(currentUser);
        if (currentUser.footcoins !== undefined) {
          this.footcoinsSubject.next(currentUser.footcoins);
        }
      }),
      catchError(error => {
        console.error('Error actualitzant footcoins:', error);
        return throwError(() => error);
      })
    );
  }
  

updateFootcoins(newAmount: number): void {
  this.footcoinsSubject.next(newAmount);
}
}
