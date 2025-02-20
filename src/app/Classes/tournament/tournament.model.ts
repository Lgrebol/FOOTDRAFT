export class Tournament {
  id: number;
  tournamentName: string;
  tournamentType: string;
  startDate: string;
  endDate: string;

  constructor(
    id: number,
    tournamentName: string,
    tournamentType: string,
    startDate: string,
    endDate: string
  ) {
    this.id = id;
    this.tournamentName = tournamentName;
    this.tournamentType = tournamentType;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  // Exemple: Calcular la durada del torneig en dies
  getDuration(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
