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
}