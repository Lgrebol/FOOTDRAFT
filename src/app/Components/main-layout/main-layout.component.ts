import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  footcoins: number = 0;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
    // Afegir gestió d'undefined amb operador nullish coalescing (??)
    this.dataService.getFootcoinsUpdates().subscribe(coins => {
      this.footcoins = coins ?? 0; // Assigna 0 si és undefined
    });
  }

  private loadUserData(): void {
    this.dataService.refreshCurrentUserData().subscribe({
      next: (user) => {
        // Assegurar que sempre s'envia un número
        this.dataService.updateFootcoins(user.footcoins ?? 0);
      },
      error: (err) => {
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
}