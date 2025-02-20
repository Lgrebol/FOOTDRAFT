import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../Serveis/store.service';
import { Player } from '../../Classes/players/player.model';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  storePlayers: Player[] = [];
  currentUserID: number = 6; // Això hauria de venir de l'autenticació
  searchTerm: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.storeService.getStorePlayers().subscribe(
      players => this.storePlayers = players
    );
  }

  applyFilters(): void {
    this.storeService.refreshStorePlayers(
      this.searchTerm, 
      this.minPrice || undefined, 
      this.maxPrice || undefined
    );
  }

  buyPlayer(playerId: number): void {
    this.storeService.buyPlayer(playerId, this.currentUserID).subscribe({
      next: () => alert('Jugador comprat correctament!'),
      error: error => alert(error.error?.error || 'Error en la compra')
    });
  }
}