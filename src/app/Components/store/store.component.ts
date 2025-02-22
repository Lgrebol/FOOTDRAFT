import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../Serveis/store.service';
import { StoreModel } from '../../Classes/store/store.model';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  storeModel: StoreModel = new StoreModel();
  currentUserID: string = '6';

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.storeService.getStorePlayers().subscribe(
      players => this.storeModel.setPlayers(players)
    );
  }

  applyFilters(): void {
    this.storeService.refreshStorePlayers(
      this.storeModel.filter.searchTerm,
      this.storeModel.filter.minPrice || undefined,
      this.storeModel.filter.maxPrice || undefined
    );
  }

  buyPlayer(playerId: string): void {
    this.storeService.buyPlayer(playerId, this.currentUserID).subscribe({
      next: () => {
        this.storeModel.setSuccess('Jugador comprat correctament!');
        this.storeModel.removePlayer(playerId);
      },
      error: error => {
        this.storeModel.setError(error.error?.error || 'Error en la compra');
      }
    });
  }
}