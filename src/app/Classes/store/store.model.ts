import { Player } from '../players/player.model';

export class Store {
  availablePlayers: Player[];

  constructor(availablePlayers: Player[] = []) {
    this.availablePlayers = availablePlayers;
  }

  addPlayer(player: Player): void {
    this.availablePlayers.push(player);
  }

  removePlayer(playerId: number): void {
    this.availablePlayers = this.availablePlayers.filter(player => player.id !== playerId);
  }
}
