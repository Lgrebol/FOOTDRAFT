import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css'],
})
export class TeamsComponent implements OnInit {
  teams: any[] = []; // Llista d'equips
  users: any[] = []; // Llista d'usuaris
  newTeam = {
    name: '',
    shirtColor: '',
    userId: null,
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTeams();
    this.fetchUsers();
  }

  // Obtenir equips
  fetchTeams() {
    this.http.get<any[]>('http://localhost:3000/api/v1/teams').subscribe(
      (data) => {
        this.teams = data;
      },
      (error) => {
        console.error('Error carregant els equips:', error);
      }
    );
  }

  // Obtenir usuaris
  fetchUsers() {
    this.http.get<any[]>('http://localhost:3000/api/v1/users').subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Error carregant els usuaris:', error);
      }
    );
  }

  // Afegir un nou equip
  addTeam() {
    if (this.newTeam.name && this.newTeam.shirtColor && this.newTeam.userId) {
      this.http
        .post('http://localhost:3000/api/v1/teams', {
          teamName: this.newTeam.name,
          shirtColor: this.newTeam.shirtColor,
          userID: this.newTeam.userId,
        })
        .subscribe(
          () => {
            this.fetchTeams(); // Actualitza la llista
            this.newTeam = { name: '', shirtColor: '', userId: null }; // Reseteja el formulari
          },
          (error) => {
            console.error('Error afegint l\'equip:', error);
          }
        );
    }
  }
  // Eliminar un equip
  deleteTeam(teamId: number) {
    this.http.delete(`http://localhost:3000/api/v1/teams/${teamId}`).subscribe(
      () => {
        this.fetchTeams(); // Actualitza la llista
      },
      (error) => {
        console.error('Error eliminant l\'equip:', error);
      }
    );
  }
}