export class Team {
  id: number;
  teamName: string;
  shirtColor: string;
  userID: number;
  username?: string;

  constructor(
    id: number,
    teamName: string,
    shirtColor: string,
    userID: number,
    username?: string
  ) {
    this.id = id;
    this.teamName = teamName;
    this.shirtColor = shirtColor;
    this.userID = userID;
    this.username = username;
  }

  // Exemple: Mostrar informació de l'equip
  displayInfo(): string {
    return `${this.teamName} (ID: ${this.id}) - Propietari: ${this.username || 'Desconegut'}`;
  }
}
