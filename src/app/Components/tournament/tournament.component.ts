import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataService, Tournament } from '../shared/data.service';

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
  newTournament = { name: '', type: 'Knockout', startDate: '', endDate: '' };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getTournaments().subscribe(
      (tournaments) => (this.tournaments = tournaments)
    );
  }

  addTournament(): void {
    if (this.newTournament.name) {
      this.dataService.addTournament({
        tournamentName: this.newTournament.name,
        tournamentType: this.newTournament.type,
        startDate: this.newTournament.startDate,
        endDate: this.newTournament.endDate
      }).subscribe(
        () => {
          this.newTournament = { name: '', type: 'Knockout', startDate: '', endDate: '' };
        },
        (error) => console.error("Error adding tournament:", error)
      );
    }
  }

  deleteTournament(id: number): void {
    this.dataService.deleteTournament(id).subscribe(
      () => {},
      (error) => console.error("Error deleting tournament:", error)
    );
  }
}
