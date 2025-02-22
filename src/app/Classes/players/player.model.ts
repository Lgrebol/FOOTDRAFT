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

  calculateRating(): number {
    return (this._height + this._speed + this._shooting) / 3;
  }

  toFormData(): FormData {
    const formData = new FormData();
    formData.append('playerName', this._playerName);
    formData.append('position', this._position);
    // Ara s'envia "teamUUID" en lloc de "teamID"
    formData.append('teamUUID', this._teamUUID);
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
}