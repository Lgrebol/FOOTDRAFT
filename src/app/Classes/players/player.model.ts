export class Player {
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
  teamName?: string;

  constructor(
    id: number,
    playerName: string,
    position: string,
    teamID: number,
    isActive: boolean,
    isForSale: boolean,
    price: number,
    height: number,
    speed: number,
    shooting: number,
    imageUrl?: string,
    points?: number,
    teamName?: string
  ) {
    this.id = id;
    this.playerName = playerName;
    this.position = position;
    this.teamID = teamID;
    this.isActive = isActive;
    this.isForSale = isForSale;
    this.price = price;
    this.height = height;
    this.speed = speed;
    this.shooting = shooting;
    this.imageUrl = imageUrl;
    this.points = points;
    this.teamName = teamName;
  }

  // Exemple de mètode: calcular la valoració del jugador
  calculateRating(): number {
    return (this.height + this.speed + this.shooting) / 3;
  }
}
