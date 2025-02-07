import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/users.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  footcoins: number = 0;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Subscripció als canvis en temps real
    this.userService.getFootcoinsUpdates().subscribe({
      next: (coins) => {
        this.footcoins = coins;
      },
      error: (err) => console.error('Error obtenint footcoins:', err)
    });

    // Càrrega inicial de dades
    this.userService.refreshUserData().subscribe({
      error: (err) => console.error('Error carregant dades inicials:', err)
    });
  }
}
