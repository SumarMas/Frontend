import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetCampaignDto, CampaignState } from '../../models/api/campaign';
import { ButtonComponent } from '../../components/button-component/button-component';
import { IconComponent } from "../../components/icon-component/icon-component";
import { CommentaryDisplayComponent } from "../../components/commentary-display-component/commentary-display-component";
import { MessageComponent } from "../../components/message-component/message-component";
import { MessageDisplayComponent } from "../../components/message-display-component/message-display-component";
import { AuthService } from '../../services/api/auth-service';
import { PostMessageDto } from '../../models/api/message';
import { AddMessageComponent } from "../../components/add-message-component/add-message-component";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: Date;
  avatar?: string;
}

@Component({
  selector: 'app-campaign-page',
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent, CommentaryDisplayComponent, MessageComponent, MessageDisplayComponent, AddMessageComponent],
  templateUrl: './campaign-page.html',
  styleUrl: './campaign-page.scss'
})
export class CampaignPage implements OnInit {
  campaign: GetCampaignDto | null = null;
  isOpen = signal(false);

  authService = inject(AuthService);

  showAddMessage = signal(false);

toggleAddMessage() {
  this.showAddMessage.set(!this.showAddMessage());
}

handleCancel() {
  this.showAddMessage.set(false);
}

handleMessageSubmitted(dto: PostMessageDto) {
  // Guardar el mensaje vía servicio
  console.log('Nuevo mensaje:', dto);
  this.showAddMessage.set(false);
}

  ngOnInit(): void {
    this.loadMockedCampaign();
  }

  loadMockedCampaign(): void {
    this.campaign = {
      id: '1',
      ngo: {
        ngoId: 'org-1',
        name: 'Fundación Ayuda Solidaria',
        description: 'Organización dedicada a ayudar a los más necesitados',
        createdDateTime: '2020-01-15',
        userCreator: {
          userId: 'user-1',
          firstName: 'Admin',
          lastName: 'Usuario',
          email: 'admin@ayudasolidaria.org'
        },
        images: []
      },
      title: 'Campaña de Invierno 2025 - Abrigo para Todos',
      goalAmount: 500000,
      currentAmount: 325000,
      description: 'Este invierno queremos llegar a 500 familias de bajos recursos con abrigo, frazadas y alimentos calientes. Tu donación marca la diferencia en la vida de quienes más lo necesitan. Cada aporte cuenta para hacer realidad este objetivo solidario.',
      endDateTime: new Date('2025-12-31'),
      createDateTime: new Date('2025-09-01'),
      campaignState: CampaignState.ACTIVE,
      categories: [
        { id: 'cat-1', name: 'Alimentación', description: 'Ayuda con alimentos' },
        { id: 'cat-2', name: 'Vestimenta', description: 'Ropa y abrigo' }
      ],
      tags: ['invierno', 'solidaridad', 'familias', 'abrigo'],
      images: ['https://i.ytimg.com/vi/ZRIZc13Mv1w/hq720.jpg?sqp=-oaymwEXCK4FEIIDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBGs6aprX-8FpoDpFNNUvQacmOEuw']
    };
  }

  getProgressPercentage(): number {
    if (!this.campaign) return 0;
    return (this.campaign.currentAmount / this.campaign.goalAmount) * 100;
  }

  getRemainingDays(): number {
    if (!this.campaign) return 0;
    const now = new Date();
    const end = new Date(this.campaign.endDateTime);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  // Para cambiar el valor:
  toggle(): void {
    this.isOpen.set(!this.isOpen()); // Actualiza el valor
  }
}
