export class Player {
  constructor(
    private _id: string,
    private _playerName: string,
    private _position: string,
    private _teamID: string,
    private _isActive: boolean,
    private _isForSale: boolean,
    private _price: number,
    private _height: number,
    private _speed: number,
    private _shooting: number,
    private _imageUrl?: string,
    private _points?: number,
    private _teamName?: string
  ) {}

  get id(): string {
    return this._id;
  }
  get playerName(): string {
    return this._playerName;
  }
  get position(): string {
    return this._position;
  }
  get teamID(): string {
    return this._teamID;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get isForSale(): boolean {
    return this._isForSale;
  }
  get price(): number {
    return this._price;
  }
  get height(): number {
    return this._height;
  }
  get speed(): number {
    return this._speed;
  }
  get shooting(): number {
    return this._shooting;
  }
  get imageUrl(): string | undefined {
    return this._imageUrl;
  }
  get points(): number | undefined {
    return this._points;
  }
  get teamName(): string | undefined {
    return this._teamName;
  }

  calculateRating(): number {
    return (this._height + this._speed + this._shooting) / 3;
  }
}
