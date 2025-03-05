export interface IMatchEvent {
    minute: number;
    eventType: string;
    description: string;
    team: string;
  }
  
  export interface IMatchCreatePayload {
    tournamentUUID: string;
    homeTeamUUID: string;
    awayTeamUUID: string;
    matchDate: string;
  }
  
  export interface IMatchBetPayload {
    matchUUID: string;
    homeTeamUUID: string;
    awayTeamUUID: string;
    amount: number;
    predictedWinner: string;
  }
  