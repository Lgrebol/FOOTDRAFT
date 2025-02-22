export class Tournament {
  constructor(
    private _tournamentUUID: string = '',
    private _tournamentName: string = '',
    private _tournamentType: string = '',
    private _startDate: string = '',
    private _endDate: string = ''
  ) {}

  get tournamentUUID(): string {
    return this._tournamentUUID;
  }
  get tournamentName(): string {
    return this._tournamentName;
  }
  get tournamentType(): string {
    return this._tournamentType;
  }
  get startDate(): string {
    return this._startDate;
  }
  get endDate(): string {
    return this._endDate;
  }

  set tournamentName(value: string) {
    this._tournamentName = value;
  }
  set tournamentType(value: string) {
    this._tournamentType = value;
  }
  set startDate(value: string) {
    this._startDate = value;
  }
  set endDate(value: string) {
    this._endDate = value;
  }

  getDuration(): number {
    const start = new Date(this._startDate);
    const end = new Date(this._endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export class TournamentFormModel {
  tournament: Tournament;
  error: string | null = null;
  success: string | null = null;
  loading: boolean = false;

  constructor() {
    this.tournament = new Tournament('', '', 'Knockout', '', '');
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
    this.tournament = new Tournament('', '', 'Knockout', '', '');
    this.error = null;
    this.success = null;
    this.loading = false;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }

  setError(error: string | null): void {
    this.error = error;
  }

  setSuccess(success: string | null): void {
    this.success = success;
    if (success) {
      setTimeout(() => {
        this.success = null;
      }, 3000);
    }
  }

  // Transforma l'objecte Tournament en un DTO per enviar al back-end
  toDTO(): any {
    return {
      tournamentName: this.tournament.tournamentName,
      tournamentType: this.tournament.tournamentType,
      startDate: this.tournament.startDate,
      endDate: this.tournament.endDate,
    }
  }
}
