export class Player {
  private _imageFile?: File;

  constructor(
    private _playerUUID: string = '',
    private _playerName: string = '',
    private _position: string = '',
    private _teamUUID: string = '',
    private _isActive: boolean = true,
    private _isForSale: boolean = false,
    private _price: number = 0,
    private _height: number = 0,
    private _speed: number = 0,
    private _shooting: number = 0,
    private _imageUrl?: string,
    private _points?: number,
    private _teamName?: string
  ) {}

  // Getters
  get playerUUID(): string { return this._playerUUID; }
  get playerName(): string { return this._playerName; }
  get position(): string { return this._position; }
  get teamUUID(): string { return this._teamUUID; }
  get isActive(): boolean { return this._isActive; }
  get isForSale(): boolean { return this._isForSale; }
  get price(): number { return this._price; }
  get height(): number { return this._height; }
  get speed(): number { return this._speed; }
  get shooting(): number { return this._shooting; }
  get imageUrl(): string | undefined { return this._imageUrl; }
  get points(): number | undefined { return this._points; }
  get teamName(): string | undefined { return this._teamName; }
  get imageFile(): File | undefined { return this._imageFile; }

  // Setters
  set playerName(value: string) { this._playerName = value; }
  set position(value: string) { this._position = value; }
  set teamUUID(value: string) { this._teamUUID = value; }
  set isActive(value: boolean) { this._isActive = value; }
  set isForSale(value: boolean) { this._isForSale = value; }
  set price(value: number) { this._price = value; }
  set height(value: number) { this._height = value; }
  set speed(value: number) { this._speed = value; }
  set shooting(value: number) { this._shooting = value; }
  set imageUrl(value: string | undefined) { this._imageUrl = value; }
  set points(value: number | undefined) { this._points = value; }
  set teamName(value: string | undefined) { this._teamName = value; }
  set imageFile(file: File | undefined) { this._imageFile = file; }

  // Mètode de càlcul (exemple)
  calculateRating(): number {
    return (this._height + this._speed + this._shooting) / 3;
  }

  // Converteix l'objecte a FormData per enviar-lo al backend
  toFormData(): FormData {
    const formData = new FormData();
    formData.append('playerName', this._playerName);
    formData.append('position', this._position);
    formData.append('teamID', this._teamUUID.trim());
    formData.append('isActive', this._isActive ? '1' : '0');
    formData.append('isForSale', this._isForSale ? '1' : '0');
    formData.append('price', String(this._price));
    formData.append('height', String(this._height));
    formData.append('speed', String(this._speed));
    formData.append('shooting', String(this._shooting));
    if (this._imageFile) {
      formData.append('image', this._imageFile);
    }
    return formData;
  }

  // Validació dels camps obligatoris i numèrics
  isValid(): boolean {
    if (this._playerName.trim() === '') {
      console.error('Validació: Falta el nom del jugador');
      return false;
    }
    if (this._position.trim() === '') {
      console.error('Validació: Falta la posició');
      return false;
    }
    if (this._teamUUID.trim() === '') {
      console.error('Validació: Falta l’identificador de l’equip');
      return false;
    }
  
    const numericFields = [
      { value: this._price, name: 'preu' },
      { value: this._height, name: 'alçada' },
      { value: this._speed, name: 'velocitat' },
      { value: this._shooting, name: 'dispar' }
    ];
  
    for (const field of numericFields) {
      if (field.value === null || field.value === undefined) {
        console.error(`Validació: Falta el ${field.name}`);
        return false;
      }
      if (isNaN(field.value)) {
        console.error(`Validació: El ${field.name} no és un número vàlid`);
        return false;
      }
    }
  
    if (!this._imageFile && !this._imageUrl) {
      console.error('Validació: Falta la imatge');
      return false;
    }
  
    return true;
  }

  // Crea una nova instància del model a partir de les dades de l'API
  static fromApi(data: any): Player {
    return new Player(
      data.PlayerUUID || data.PlayerID,
      data.PlayerName,
      data.Position,
      data.TeamUUID || data.TeamID,
      data.IsActive,
      data.IsForSale,
      data.Price,
      data.Height,
      data.Speed,
      data.Shooting,
      data.PlayerImage,
      data.Points,
      data.TeamName
    );
  }

  // Crea una còpia de l'objecte (per treballar amb un clon en l'edició)
  static clone(player: Player): Player {
    return new Player(
      player.playerUUID,
      player.playerName,
      player.position,
      player.teamUUID,
      player.isActive,
      player.isForSale,
      player.price,
      player.height,
      player.speed,
      player.shooting,
      player.imageUrl,
      player.points,
      player.teamName
    );
  }

  updateFromApi(data: any): void {
    this._playerUUID = data.PlayerUUID || data.PlayerID || this._playerUUID;
    this._playerName = data.PlayerName || this._playerName;
    this._position = data.Position || this._position;
    this._teamUUID = data.TeamUUID || data.TeamID || this._teamUUID;
    this._isActive = data.IsActive ?? this._isActive;
    this._isForSale = data.IsForSale ?? this._isForSale;
    this._price = data.Price ?? this._price;
    this._height = data.Height ?? this._height;
    this._speed = data.Speed ?? this._speed;
    this._shooting = data.Shooting ?? this._shooting;
    this._imageUrl = data.PlayerImage || this._imageUrl;
    this._points = data.Points ?? this._points;
    this._teamName = data.TeamName || this._teamName;
  }
}
