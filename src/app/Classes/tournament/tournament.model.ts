import { ITournamentApiResponse } from '../../Interfaces/tournament-api-response.interface';

export class Tournament {
  private _tournamentUUID: string = '';
  private _tournamentName: string = '';
  private _tournamentType: string = '';
  private _startDate: string = '';
  private _endDate: string = '';

  constructor() {}

  get tournamentUUID(): string { return this._tournamentUUID; }
  set tournamentUUID(value: string) { this._tournamentUUID = value; }

  get tournamentName(): string { return this._tournamentName; }
  set tournamentName(value: string) { this._tournamentName = value; }

  get tournamentType(): string { return this._tournamentType; }
  set tournamentType(value: string) { this._tournamentType = value; }

  get startDate(): string { return this._startDate; }
  set startDate(value: string) { this._startDate = value; }

  get endDate(): string { return this._endDate; }
  set endDate(value: string) { this._endDate = value; }

  static fromApi(data: ITournamentApiResponse): Tournament {
    const tournament = new Tournament();
    tournament.tournamentUUID = data.TournamentUUID;
    tournament.tournamentName = data.TournamentName;
    tournament.tournamentType = data.TournamentType;
    tournament.startDate = data.StartDate;
    tournament.endDate = data.EndDate;
    return tournament;
  }
}

// Si vols gestionar el formulari amb una classe especial:
export class TournamentFormModel {
  tournament: Tournament;
  error: string | null = null;
  success: string | null = null;
  loading: boolean = false;

  constructor() {
    this.tournament = new Tournament();
    this.tournament.tournamentType = 'Knockout'; // valor per defecte
  }

  updateTournament(data: Partial<{ tournamentName: string; tournamentType: string; startDate: string; endDate: string }>): void {
    if (data.tournamentName !== undefined) {
      this.tournament.tournamentName = data.tournamentName;
    }
    if (data.tournamentType !== undefined) {
      this.tournament.tournamentType = data.tournamentType;
    }
    if (data.startDate !== undefined) {
      this.tournament.startDate = data.startDate;
    }
    if (data.endDate !== undefined) {
      this.tournament.endDate = data.endDate;
    }
  }

  resetForm(): void {
    this.tournament = new Tournament();
    this.tournament.tournamentType = 'Knockout';
    this.error = null;
    this.success = null;
    this.loading = false;
  }

  setLoading(loading: boolean): void { this.loading = loading; }
  setError(error: string | null): void { this.error = error; }
  setSuccess(success: string | null): void {
    this.success = success;
    if (success) {
      setTimeout(() => { this.success = null; }, 3000);
    }
  }

  toDTO(): { tournamentName: string; tournamentType: string; startDate: string; endDate: string } {
    return {
      tournamentName: this.tournament.tournamentName,
      tournamentType: this.tournament.tournamentType,
      startDate: this.tournament.startDate,
      endDate: this.tournament.endDate,
    };
  }
}
