import { Player } from '../players/player.model';

export class Store {
  constructor(private _availablePlayers: Player[] = []) {}

  get availablePlayers(): Player[] {
    return this._availablePlayers;
  }

  set availablePlayers(players: Player[]) {
    this._availablePlayers = players;
  }

  addPlayer(player: Player): void {
    this._availablePlayers.push(player);
  }

  removePlayer(playerUUID: string): void {
    this._availablePlayers = this._availablePlayers.filter(player => player.playerUUID !== playerUUID);
  }
}

export class StoreFilterModel {
  searchTerm: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(
    searchTerm: string = '',
    minPrice: number | null = null,
    maxPrice: number | null = null
  ) {
    this.searchTerm = searchTerm;
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
  }

  updateFilters(filters: Partial<{ searchTerm: string; minPrice: number; maxPrice: number }>): void {
    if (filters.searchTerm !== undefined) {
      this.searchTerm = filters.searchTerm;
    }
    if (filters.minPrice !== undefined) {
      this.minPrice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      this.maxPrice = filters.maxPrice;
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
  }

  toParams(): any {
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.minPrice != null) params.minPrice = this.minPrice;
    if (this.maxPrice != null) params.maxPrice = this.maxPrice;
    return params;
  }
}

export class StoreModel {
  store: Store;
  filter: StoreFilterModel;
  error: string | null = null;
  success: string | null = null;
  loading: boolean = false;

  constructor() {
    this.store = new Store([]);
    this.filter = new StoreFilterModel();
  }

  setPlayers(players: Player[]): void {
    this.store.availablePlayers = players;
  }

  addPlayer(player: Player): void {
    this.store.addPlayer(player);
  }

  removePlayer(playerUUID: string): void {
    this.store.removePlayer(playerUUID);
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

  updateFilters(filters: Partial<{ searchTerm: string; minPrice: number; maxPrice: number }>): void {
    this.filter.updateFilters(filters);
  }

  toFilterParams(): any {
    return this.filter.toParams();
  }
}
