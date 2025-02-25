import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TournamentService } from '../../Serveis/tournament.service';
import { Tournament, TournamentFormModel } from '../../Classes/tournament/tournament.model';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class TournamentComponent implements OnInit {
  tournaments: Tournament[] = [];
  tournamentForm: TournamentFormModel = new TournamentFormModel();

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
    this.tournamentService.getTournaments().subscribe(
      (tournaments) => this.tournaments = tournaments
    );
  }

  addTournament(): void {
    if (this.tournamentForm.tournament.tournamentName) {
      this.tournamentForm.setLoading(true);
      this.tournamentService.addTournament(this.tournamentForm.toDTO()).subscribe({
        next: () => {
          this.tournamentForm.resetForm();
          this.tournamentForm.setSuccess('Torneig afegit correctament');
        },
        error: (error) => {
          console.error("Error adding tournament:", error);
          this.tournamentForm.setError('Error afegint torneig');
        },
        complete: () => {
          this.tournamentForm.setLoading(false);
        }
      });
    } else {
      this.tournamentForm.setError('Error afegint torneig');
    }
  }

  deleteTournament(tournamentUUID: string): void {
    this.tournamentService.deleteTournament(tournamentUUID).subscribe({
      next: () => {
        this.tournaments = this.tournaments.filter(t => t.tournamentUUID !== tournamentUUID);
      },
      error: (error) => console.error("Error deleting tournament:", error)
    });
  }  

  trackById(index: number, item: Tournament): string {
    return item.tournamentUUID;
  }
}