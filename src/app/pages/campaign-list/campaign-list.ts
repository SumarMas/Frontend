import { Component, inject, OnInit, signal } from '@angular/core';
import { IconComponent } from "../../components/icon-component/icon-component";
import { ButtonComponent } from "../../components/button-component/button-component";
import { CampaignCard } from "../../components/campaign-card/campaign-card";
import { CampaignState, GetCampaignDto } from '../../models/api/campaign';
import { FormsModule } from "@angular/forms";
import { CommonModule, DecimalPipe } from '@angular/common';
import { CategoryFilterDisplay } from "../../components/category-filter-display/category-filter-display";
import { CampaignService } from '../../services/api/campaign-service';
import { ToastService } from '../../services/ui/toast-service';

@Component({
  selector: 'app-campaign-list',
  imports: [IconComponent, ButtonComponent, CampaignCard, CommonModule, FormsModule, CategoryFilterDisplay, DecimalPipe],
  templateUrl: './campaign-list.html',
  styleUrl: './campaign-list.scss'
})
export class CampaignList implements OnInit {
  campaignsCopy: GetCampaignDto[] = [];
  campaigns: GetCampaignDto[] = [];
  isLoading = signal<boolean>(true);
  
  private campaignService = inject(CampaignService);
  private toastService = inject(ToastService);
  
  private _selectedCategoryIds: string[] = [];
  
  get selectedCategoryIds(): string[] {
    return this._selectedCategoryIds;
  }
  
  set selectedCategoryIds(value: string[]) {
    this._selectedCategoryIds = value;
    this.applyAllFilters();
  }

  _searchInput: string = '';

  ngOnInit(): void {
    this.fetchCampaigns();
  }

  fetchCampaigns() {
    this.isLoading.set(true);
    
    // Obtener campañas activas del backend
    this.campaignService.filter('ACTIVE').subscribe({
      next: (campaigns) => {
        console.log('Campañas recibidas del backend:', campaigns);
        console.log('Cantidad de campañas:', campaigns.length);
        
        // Verificar si hay duplicados por ID
        const uniqueCampaigns = campaigns.filter((campaign, index, self) =>
          index === self.findIndex((c) => c.id === campaign.id)
        );
        
        if (uniqueCampaigns.length !== campaigns.length) {
          console.warn('Se encontraron campañas duplicadas. Filtrando...');
        }
        
        this.campaigns = uniqueCampaigns;
        this.campaignsCopy = uniqueCampaigns;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar campañas:', error);
        this.toastService.open('Error al cargar las campañas', 'error', 3000);
        this.isLoading.set(false);
      }
    });
  }

  get searchInput(): string {
    return this._searchInput;
  }

  set searchInput(newValue: string) {
    this._searchInput = newValue;
    this.applyAllFilters();
  }

  applyAllFilters() {
    //limpiar lista antes de aplicar filtros
    let filtered = [...this.campaignsCopy];

    //filtro para busqueda por texto (nombre, descripción y tags)
    const searchTerm = this._searchInput.toLowerCase().trim();
    if (searchTerm.length > 0) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    //filtro para categorias seleccionadas
    if (this.selectedCategoryIds.length > 0) {
      filtered = filtered.filter(campaign =>
        campaign.categories.some(cat =>
          this.selectedCategoryIds.includes(cat.id)
        )
      );
    }

    this.campaigns = filtered;
  }

  clearFilters() {
    this._searchInput = '';
    this.selectedCategoryIds = []; // Con banana in a box, esto automáticamente resetea los chips
    this.campaigns = [...this.campaignsCopy];
  }

  getTotalRaised(): number {
    if (this.campaigns.length === 0) return 0;
    return this.campaigns.reduce((sum, campaign) => sum + (campaign.current_amount || 0), 0);
  }

  getAverageProgress(): number {
    if (this.campaigns.length === 0) return 0;
    const totalProgress = this.campaigns.reduce((sum, campaign) => {
      if (!campaign.goal_amount || campaign.goal_amount === 0) return sum;
      const progress = ((campaign.current_amount ?? 0) / campaign.goal_amount) * 100;
      return sum + progress;
    }, 0);
    return Math.round(totalProgress / this.campaigns.length);
  }
}
