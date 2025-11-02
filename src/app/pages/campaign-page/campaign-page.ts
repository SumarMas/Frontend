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
import { Router } from '@angular/router';

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
  router = inject(Router);

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
        ngoId: 'qewrqwerqer',
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

  /**
   * Obtiene el porcentaje de progreso de la campaña.
   * @returns number
   */
  getProgressPercentage(): number {
    if (!this.campaign) return 0;
    return (this.campaign.currentAmount / this.campaign.goalAmount) * 100;
  }

  /**
   * Obtiene los días restantes para la campaña.
   * @returns number
   */
  getRemainingDays(): number {
    if (!this.campaign) return 0;
    const now = new Date();
    const end = new Date(this.campaign.endDateTime);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /** Formatea una fecha al formato local. */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /** Formatea un monto al formato de moneda local. */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  //Cambia la visibilidad del panel de comentarios
  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  /**
   * Navega a una URL con parámetros opcionales.
   * @param url - dirección a la que se quiere navegar
   * @param params {[key: string]: string} - parámetros adicionales para la navegación
   * @examples
   * this.navigate('/my-profile');
   * this.navigate('/campaigns/:id', { id: '123' });
   * this.navigate('/campaigns/:id/donations/:donationId', { id: '123', donationId: '456' });
   */
  navigate(url: string, params?: { [key: string]: string }): void {
    if (params) {
      Object.keys(params).forEach(key => {
        //reemplaza solo coincidencias exactas de :key seguidas por / o fin de string
        url = url.replace(new RegExp(`:${key}(?=/|$)`, 'g'), params[key]);
      });
    }

    this.router.navigate([url]);
    console.log('Navegando a:', url);
  }
}
