import { Player } from '../players/player.model';

export class Store {
  constructor(private _availablePlayers: Player[] = []) {}

  get availablePlayers(): Player[] {
    return this._availablePlayers;
  }

  addPlayer(player: Player): void {
    this._availablePlayers.push(player);
  }

  removePlayer(playerId: string): void {
    this._availablePlayers = this._availablePlayers.filter(player => player.id !== playerId);
  }  
}