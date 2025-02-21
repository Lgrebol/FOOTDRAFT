export class Match {
  constructor(
    private _id: string,
    private _homeTeamID: string,
    private _awayTeamID: string,
    private _homeGoals: number,
    private _awayGoals: number,
    private _currentMinute: number,
    private _tournamentID: string,
    private _matchDate: string,
    private _events: Array<{ minute: number; eventType: string; description: string; team: string }> = []
  ) {}

  get id(): string {
    return this._id;
  }
  get homeTeamID(): string {
    return this._homeTeamID;
  }
  get awayTeamID(): string {
    return this._awayTeamID;
  }
  get homeGoals(): number {
    return this._homeGoals;
  }
  get awayGoals(): number {
    return this._awayGoals;
  }
  get currentMinute(): number {
    return this._currentMinute;
  }
  get tournamentID(): string {
    return this._tournamentID;
  }
  get matchDate(): string {
    return this._matchDate;
  }
  get events(): Array<{ minute: number; eventType: string; description: string; team: string }> {
    return this._events;
  }

  addEvent(event: { minute: number; eventType: string; description: string; team: string }): void {
    this._events.push(event);
  }
}
