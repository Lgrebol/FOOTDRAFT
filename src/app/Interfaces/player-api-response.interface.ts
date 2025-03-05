export interface IPlayerApiResponse {
  PlayerUUID?: string;
  PlayerID?: string;
  PlayerName: string;
  Position: string;
  TeamUUID?: string;
  TeamID?: string;
  IsActive: boolean;
  IsForSale: boolean;
  Price: number;
  Height: number;
  Speed: number;
  Shooting: number;
  PlayerImage?: string;
  Points?: number;
  TeamName?: string;
}
