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
  currentUserUUID: string = localStorage.getItem('userUUID') || '';

  searchTerm: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.storeService.getStorePlayers().subscribe(players => { 
      this.storeModel.setPlayers(players); 
    });
  }

  get storePlayers() { return this.storeModel.store.availablePlayers; }

  fetchStorePlayers(): void {
    this.storeService.refreshStorePlayers(this.searchTerm, this.minPrice ?? undefined, this.maxPrice ?? undefined);
  }

  applyFilters(): void {
    this.storeService.refreshStorePlayers(
      this.storeModel.filter.searchTerm, 
      this.storeModel.filter.minPrice ?? undefined, 
      this.storeModel.filter.maxPrice ?? undefined
    );
  }
  
  buyPlayer(playerUUID: string): void {
    if (!this.currentUserUUID) {
      this.storeModel.setError('Usuari no identificat. Inicia sessió per comprar jugadors.');
      return;
    }
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
