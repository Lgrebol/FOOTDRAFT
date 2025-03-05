export interface IMatchEventApi {
    minute?: number;
    Minute?: number;
    eventType?: string;
    EventType?: string;
    description?: string;
    Description?: string;
    team?: string;
    Team?: string;
  }
  
  export interface IMatchApiResponse {
    MatchUUID?: string;
    id?: string;
    HomeTeamUUID: string;
    AwayTeamUUID: string;
    HomeGoals: number;
    AwayGoals: number;
    CurrentMinute: number;
    TournamentUUID: string;
    MatchDate: string;
    events?: IMatchEventApi[];
  }
  