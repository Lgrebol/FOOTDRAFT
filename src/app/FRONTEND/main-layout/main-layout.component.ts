import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.getFootcoinsUpdates().subscribe({
      next: (coins) => {
        this.footcoins = coins;
      },
      error: (err) => console.error('Error obtenint footcoins:', err)
    });

    this.userService.refreshUserData().subscribe({
      error: (err) => console.error('Error carregant dades inicials:', err)
    });
  }  

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userID');
    this.router.navigate(['/login']);
  }
  
}
