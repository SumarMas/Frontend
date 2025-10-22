import { Component, OnInit } from '@angular/core';
import { IconComponent } from "../../components/icon-component/icon-component";
import { ButtonComponent } from "../../components/button-component/button-component";
import { CampaignCard } from "../../components/campaign-card/campaign-card";
import { CampaignState, GetCampaignDto } from '../../models/api/campaign';
import { GetOrganizationDto } from '../../models/api/organization';

@Component({
  selector: 'app-campaign-list',
  imports: [IconComponent, ButtonComponent, CampaignCard],
  templateUrl: './campaign-list.html',
  styleUrl: './campaign-list.scss'
})
export class CampaignList implements OnInit{
  campaigns : GetCampaignDto[] = []

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
      id: 'kfkadjk',
      ngo: this.organization,
      title: 'Campaña de Invierno',
      description: 'Recaudación de fondos para proveer ropa y refugio a personas en situación de calle durante el invierno.',
      goalAmount: 5000,
      currentAmount: 3200,
      endDateTime: new Date('2024-12-31T23:59:59Z'),
      createDateTime: new Date('2024-10-01T10:00:00Z'),
      categories: [{id: '1', name: 'Ropa', description: 'Campañas relacionadas con la recolección y distribución de ropa.'}],
      tags: ['invierno', 'refugio', 'ropa'],
      campaignState: CampaignState.ACTIVE,
    },
  ]

  ngOnInit(): void {
    this.fetchCampaigns();
  }

  fetchCampaigns(){
    //llamar al servicio para obtener las campañas
    this.campaigns = this.mockCampaigns;
  }
}
