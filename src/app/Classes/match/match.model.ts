  import { IMatchEvent, IMatchCreatePayload, IMatchBetPayload } from '../../Interfaces/match.interface';
  import { IMatchApiResponse, IMatchEventApi } from '../../Interfaces/match-api-response.interface';

  export class Match {
    private _id: string = '';
    private _homeTeamUUID: string = '';
    private _awayTeamUUID: string = '';
    private _homeGoals: number = 0;
    private _awayGoals: number = 0;
    private _currentMinute: number = 0;
    private _tournamentUUID: string = '';
    private _matchDate: string = '';
    private _events: IMatchEvent[] = [];

    constructor() {}

    get id(): string { return this._id; }
    get homeTeamUUID(): string { return this._homeTeamUUID; }
    get awayTeamUUID(): string { return this._awayTeamUUID; }
    get homeGoals(): number { return this._homeGoals; }
    get awayGoals(): number { return this._awayGoals; }
    get currentMinute(): number { return this._currentMinute; }
    get tournamentUUID(): string { return this._tournamentUUID; }
    get matchDate(): string { return this._matchDate; }
    get events(): IMatchEvent[] { return this._events; }

    addEvent(event: IMatchEvent): void { this._events.push(event); }

    isMatchEnded(): boolean { return this._currentMinute > 90; }

    getSummary(): { 
      homeGoals: number; 
      awayGoals: number; 
      totalGoals: number; 
      totalFouls: number; 
      totalRedCards: number; 
      matchEnded: boolean; 
      message: string; 
    } {
      const totalFouls = this._events.filter(e => e.eventType === 'Falta').length;
      const totalRedCards = this._events.filter(e => e.eventType === 'Vermella').length;
      return {
        homeGoals: this._homeGoals,
        awayGoals: this._awayGoals,
        totalGoals: this._homeGoals + this._awayGoals,
        totalFouls: totalFouls,
        totalRedCards: totalRedCards,
        matchEnded: this.isMatchEnded(),
        message: "El partit ha finalitzat!"
      };
    }

    static fromApi(data: IMatchApiResponse): Match {
      const events: IMatchEvent[] = (data.events || []).map((e: IMatchEventApi) => ({
        minute: e.minute ?? e.Minute ?? 0,
        eventType: e.eventType ?? e.EventType ?? '',
        description: e.description ?? e.Description ?? '',
        team: e.team ?? e.Team ?? ''
      }));
      const match = new Match();
      match._id = data.MatchUUID ?? data.id ?? '';
      match._homeTeamUUID = data.HomeTeamUUID;
      match._awayTeamUUID = data.AwayTeamUUID;
      match._homeGoals = data.HomeGoals;
      match._awayGoals = data.AwayGoals;
      match._currentMinute = data.CurrentMinute;
      match._tournamentUUID = data.TournamentUUID;
      match._matchDate = data.MatchDate;
      match._events = events;
      return match;
    }

    static createNew(tournamentUUID: string, homeTeamUUID: string, awayTeamUUID: string, matchDate: Date): Match {
      const match = new Match();
      match._tournamentUUID = tournamentUUID;
      match._homeTeamUUID = homeTeamUUID;
      match._awayTeamUUID = awayTeamUUID;
      match._matchDate = matchDate.toISOString();
      return match;
    }

    toApi(): IMatchCreatePayload {
      return {
        tournamentUUID: this._tournamentUUID,
        homeTeamUUID: this._homeTeamUUID,
        awayTeamUUID: this._awayTeamUUID,
        matchDate: this._matchDate
      };
    }

    toBetApi(betAmount: number, predictedWinner: string, homeTeamUUID: string, awayTeamUUID: string): IMatchBetPayload {
      return {
        matchUUID: this._id,
        homeTeamUUID: homeTeamUUID,
        awayTeamUUID: awayTeamUUID,
        amount: betAmount,
        predictedWinner: predictedWinner
      };
    }

    updateFromApi(data: IMatchApiResponse): void {
      this._homeGoals = data.HomeGoals;
      this._awayGoals = data.AwayGoals;
      this._currentMinute = data.CurrentMinute;
      this._events = (data.events || []).map((e: IMatchEventApi) => ({
        minute: e.minute ?? e.Minute ?? 0,
        eventType: e.eventType ?? e.EventType ?? '',
        description: e.description ?? e.Description ?? '',
        team: e.team ?? e.Team ?? ''
      }));
    }
  }
