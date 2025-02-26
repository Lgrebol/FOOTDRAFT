import { Player } from './player.model';

export class PlayerList {
  private _allPlayers: Player[] = [];
  private _filteredPlayers: Player[] = [];
  private _selectedTeam: string = '';

  public itemsPerPage: number = 12;
  public currentPage: number = 1;
  public totalPages: number = 1;

  constructor(players: Player[] = []) {
    this.players = players;
  }

  set players(players: Player[]) {
    this._allPlayers = players;
    this.applyFilter();
  }

  get players(): Player[] {
    return this._allPlayers;
  }

  set selectedTeam(teamUUID: string) {
    this._selectedTeam = teamUUID;
    this.currentPage = 1; // reiniciem la pàgina
    this.applyFilter();
  }

  get selectedTeam(): string {
    return this._selectedTeam;
  }

  get filteredPlayers(): Player[] {
    return this._filteredPlayers;
  }

  get paginatedPlayers(): Player[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this._filteredPlayers.slice(start, end);
  }

  private applyFilter(): void {
    if (this._selectedTeam) {
      this._filteredPlayers = this._allPlayers.filter(player => player.teamUUID === this._selectedTeam);
    } else {
      this._filteredPlayers = [...this._allPlayers];
    }
    this.totalPages = Math.ceil(this._filteredPlayers.length / this.itemsPerPage) || 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
