import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetCampaignDto } from '../../models/api/campaign';
import { ButtonComponent } from '../../components/button-component/button-component';
import { IconComponent } from "../../components/icon-component/icon-component";
import { CommentaryDisplayComponent } from "../../components/commentary-display-component/commentary-display-component";
import { MessageDisplayComponent } from "../../components/message-display-component/message-display-component";
import { AuthService } from '../../services/api/auth-service';
import { AddMessageComponent } from "../../components/add-message-component/add-message-component";
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignService } from '../../services/api/campaign-service';
import { FileService } from '../../services/api/file-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastService } from '../../services/ui/toast-service';
import { ReusableModalComponent } from '../../components/reusable-modal-component/reusable-modal-component';
import { DonationRegister } from "../donation-register/donation-register";

@Component({
  selector: 'app-campaign-page',
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent, ReusableModalComponent,
    CommentaryDisplayComponent, MessageDisplayComponent, AddMessageComponent,
    CurrencyPipe, DonationRegister],
  templateUrl: './campaign-page.html',
  styleUrl: './campaign-page.scss'
})
export class CampaignPage implements OnInit {
  campaign: GetCampaignDto | null = null;
  isOpen = signal(false);
  campaignImageUrl = signal<SafeUrl | null>(null);

  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  campaignService = inject(CampaignService);
  fileService = inject(FileService);
  sanitizer = inject(DomSanitizer);
  toastService = inject(ToastService);

  showAddMessage = signal(false);

  campaignId: string = '';

  @ViewChild('donateModal') donateModalRef!: ReusableModalComponent;

  toggleAddMessage() {
    this.showAddMessage.set(!this.showAddMessage());
  }

  handleCancel() {
    this.showAddMessage.set(false);
  }

  handleMessageSubmitted() {
    // Cerrar el formulario y recargar la página para mostrar el nuevo mensaje
    this.showAddMessage.set(false);
    // Recargar la campaña para actualizar los mensajes
    if (this.campaignId) {
      this.loadCampaign();
    }
  }

  ngOnInit(): void {
    this.campaignId = this.route.snapshot.paramMap.get('campaignId') || '';
    if (this.campaignId) {
      this.loadCampaign();
      console.log('CAMAPAÑA ', this.campaign);
      
    } else {
      this.toastService.open('ID de campaña inválido', 'error', 3000);
      this.router.navigate(['/campaigns']);
    }
  }

  loadCampaign(): void {
    this.campaignService.getCampaignById(this.campaignId).subscribe({
      next: (campaign) => {
        this.campaign = campaign;
        console.log('Campaign loaded:', campaign);
        
        // Cargar la primera imagen si existe (imageIds[0])
        if (campaign.images && campaign.images.length > 0) {
          console.log('Loading campaign image:', campaign.images[0]);
          this.loadCampaignImage(campaign.images[0]);
        } else {
          console.log('No images available for campaign');
        }
      },
      error: (error) => {
        console.error('Error al cargar campaña:', error);
        this.toastService.open('Error al cargar la campaña', 'error', 3000);
        this.router.navigate(['/campaigns']);
      }
    });
  }

  loadCampaignImage(imageId: string): void {
    this.fileService.getFile(imageId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.campaignImageUrl.set(safeUrl);
      },
      error: (err) => {
        console.error('Error al cargar imagen de campaña:', err);
      }
    });
  }

  /**
   * Obtiene el porcentaje de progreso de la campaña.
   * @returns number
   */
  getProgressPercentage(): number {
    if (!this.campaign || !this.campaign.goal_amount || !this.campaign.current_amount) return 0;
    return (this.campaign.current_amount / this.campaign.goal_amount) * 100;
  }

  /**
   * Obtiene los días restantes para la campaña.
   * @returns number
   */
  getRemainingDays(): number {
    if (!this.campaign) return 0;
    const endDate = this.campaign.endDateTime || this.campaign.end_date_time;
    if (!endDate) return 0;
    
    // Crear fechas sin considerar la hora para comparación de días completos
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  }

  /** Formatea una fecha al formato local. */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Fecha no disponible';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    return dateObj.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /** Formatea un monto al formato de moneda local. */
  formatCurrency(amount: number): string {
    if (!amount || amount == 0) return '$0';
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
