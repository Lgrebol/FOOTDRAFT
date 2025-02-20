import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Player } from '../shared/data.service';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  storePlayers: Player[] = [];
  currentUserID: number = 6;

  searchTerm: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getStorePlayers().subscribe(
      (players) => (this.storePlayers = players)
    );
  }

  applyFilters(): void {
    this.dataService.refreshStorePlayers(this.searchTerm, this.minPrice || undefined, this.maxPrice || undefined);
  }

  buyPlayer(playerId: number): void {
    this.dataService.buyPlayer(playerId, this.currentUserID).subscribe(
      (res: any) => {
        alert(res.message);
      },
      (error) => {
        console.error('Error buying player:', error);
        alert(error.error?.error || 'Error buying player');
      }
    );
  }
}
