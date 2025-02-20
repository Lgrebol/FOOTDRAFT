export class LoginRegister {
  email: string;
  password: string;
  username?: string; // Només per registre

  constructor(email: string, password: string, username?: string) {
    this.email = email;
    this.password = password;
    this.username = username;
  }

  // Exemple: Validar dades d'entrada
  isValid(): boolean {
    return this.email.includes('@') && this.password.length > 0;
  }
}
