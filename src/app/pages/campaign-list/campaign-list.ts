import { Component, OnInit } from '@angular/core';
import { IconComponent } from "../../components/icon-component/icon-component";
import { ButtonComponent } from "../../components/button-component/button-component";
import { CampaignCard } from "../../components/campaign-card/campaign-card";
import { CampaignState, GetCampaignDto } from '../../models/api/campaign';
import { GetOrganizationDto } from '../../models/api/organization';
import { CategoryDto } from '../../models/api/category';
import { FormsModule, ɵInternalFormsSharedModule } from "@angular/forms";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campaign-list',
  imports: [IconComponent, ButtonComponent, CampaignCard, ɵInternalFormsSharedModule, CommonModule, FormsModule],
  templateUrl: './campaign-list.html',
  styleUrl: './campaign-list.scss'
})
export class CampaignList implements OnInit{
  campaignsCopy : GetCampaignDto[] = []
  campaigns : GetCampaignDto[] = []

  _searchInput: string = '';

  organization: GetOrganizationDto = {
      ngoId: '4dbb8d30-5483-499c-a498-b0883b46dc87',
      name: 'Manos abiertas',
      description: 'Somos una organización que ayuda a personas en situación de calle proporcionando alimentos, ropa y apoyo emocional. Nuestra misión es brindar un refugio seguro y digno para aquellos que más lo necesitan, promoviendo la inclusión social y el respeto por los derechos humanos. Trabajamos con voluntarios comprometidos y colaboramos con otras entidades para maximizar nuestro impacto y llegar a más personas. Juntos, podemos construir una comunidad más solidaria y justa.',
      status: 'PENDING',
      userCreator: { userId: '11111111-1111-1111-1111-111111111111', firstName: 'Pablo', lastName: 'Diaz', email: 'pablo@tesxt.com', roles: ['ORGANIZATION', 'DONOR'] },
      images: [{imageId: 'fdask', orderIndex: 2}],
      createdDateTime: '2023-10-01T10:00:00Z'
    };

  mockCampaigns : GetCampaignDto[] = [
    {
      id: '11111',
      ngo: this.organization,
      title: 'Campaña de Invierno',
      description: 'Recaudación de fondos para proveer ropa y refugio a personas en situación de calle durante el invierno.',
      goalAmount: 5000,
      currentAmount: 3200,
      endDateTime: new Date('2025-10-20T16:52:10'),
      createDateTime: new Date('2024-10-01T10:00:00Z'),
      categories: [{id: '1', name: 'Ropa', description: 'Campañas relacionadas con la recolección y distribución de ropa.'}],
      tags: ['invierno', 'refugio', 'ropa'],
      campaignState: CampaignState.ACTIVE,
    },
  ]

  categories : CategoryDto[] = [
    {id: '1', name: 'Ropa', description: 'Campañas relacionadas con la recolección y distribución de ropa.'},
    {id: '2', name: 'Alimentos', description: 'Campañas enfocadas en la provisión de alimentos a comunidades necesitadas.'},
    {id: '3', name: 'Educación', description: 'Iniciativas para apoyar la educación y el acceso a recursos educativos.'},
    {id: '4', name: 'Salud', description: 'Proyectos destinados a mejorar la salud y el bienestar de las personas.'}
  ]

  ngOnInit(): void {
    this.fetchCampaigns();
  }

  fetchCampaigns(){
    //llamar al servicio para obtener las campañas
    this.campaigns = this.mockCampaigns;
    this.campaignsCopy = this.campaigns;
  }

  get searchInput(): string {
    return this._searchInput;
  }

  set searchInput(newValue: string) {
    //almacenar valor
    this._searchInput = newValue;
    
    //ejecutar filtro
    this.search();
  }

  search(){
    this.campaigns = this.campaignsCopy;
    
    const term = this.searchInput.toLowerCase();

    if(term){
      this.campaigns = this.campaigns.filter(c => c.title.toLowerCase().includes(term) || c.tags.some(tag => tag.toLowerCase().includes(term)));
    }
  }
}
