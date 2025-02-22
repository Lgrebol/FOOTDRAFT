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
  currentUserUUID: string = '6';

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

  buyPlayer(playerUUID: string): void {
    this.storeService.buyPlayer(playerUUID, this.currentUserUUID).subscribe({
      next: () => {
        this.storeModel.setSuccess('Jugador comprat correctament!');
        this.storeModel.removePlayer(playerUUID);
      },
      error: error => {
        this.storeModel.setError(error.error?.error || 'Error en la compra');
      }
    });
  }
}