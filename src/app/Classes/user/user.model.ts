export class User {
  id: number;
  username: string;
  email: string;
  footcoins: number;

  constructor(id: number, username: string, email: string, footcoins: number) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.footcoins = footcoins;
  }

  // Exemple: Actualitzar les footcoins de l'usuari
  updateFootcoins(newAmount: number): void {
    this.footcoins = newAmount;
  }
}
