import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { ButtonComponent } from '../../components/button-component/button-component';
import { IconComponent } from '../../components/icon-component/icon-component';
import { GetDonationDto } from '../../models/api/donation';
import { DonationService } from '../../services/api/donation-service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import {Donation} from '../../models/api/payouts';

// Interfaz temporal para donaciones (hasta que exista el DTO real)
interface DonationDto {
  donationId: string;
  campaignTitle: string;
  campaignId: string;
  organizationName: string;
  amount: number;
  donationDate: Date;
  transactionId: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  isAnonymous: boolean;
}

@Component({
  selector: 'app-my-donations',
  imports: [CommonModule, ButtonComponent, IconComponent, NgClass, DatePipe],
  templateUrl: './my-donations.html',
  styleUrl: './my-donations.scss'
})
export class MyDonations implements OnInit {
  donations = signal<GetDonationDto[]>([]);
  isLoading = signal<boolean>(true);
  totalDonated = signal<number>(0);

  donationService = inject(DonationService);
  router = inject(Router);


  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations() {
    this.donationService.getDonationsByUser().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (donations) => {
        this.donations.set(donations);
        this.donations().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        this.calculateTotal();
        console.log(this.donations());

      },
      error: (error) => {
        console.error('Error loading donations:', error);
      }
    });
  }

  calculateTotal() {
    const total = this.donations().reduce((sum, donation) => sum + donation.amount, 0);
    this.totalDonated.set(total);
  }

  getStatusClass(status: string): string {
    const classes = {
      'CREATED': 'badge badge-warning',
      'CONFIRMED': 'badge badge-success',
      'PENDING': 'badge badge-warning',
      'CANCELLED': 'badge badge-error',
      'PAID': 'badge badge-success'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getStatusText(status: string): string {
    const texts = {
      'CREATED': 'Pendiente',
      'CONFIRMED': 'Completada',
      'PENDING': 'Pendiente',
      'CANCELLED': 'Cancelada',
      'PAID': 'Completada',
    };
    return texts[status as keyof typeof texts] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Obtiene la fecha de donación manejando diferentes formatos:
   * - Array de números [año, mes, día, hora, minuto, segundo] (payment_datetime)
   * - String ISO "2025-11-21T22:31:53" (created_at)
   * - null
   */
  getDonationDate(donation: GetDonationDto): Date | null {
    // Intentar primero con payment_datetime (array de números)
    // if (donation.created_at && Array.isArray(donation.payment_datetime)) {
    //   const arr = donation.payment_datetime;
    //   if (arr.length >= 3) {
    //     return new Date(
    //       arr[0], // año
    //       arr[1] - 1, // mes (0-indexed)
    //       arr[2], // día
    //       arr[3] || 0, // hora
    //       arr[4] || 0, // minuto
    //       arr[5] || 0  // segundo
    //     );
    //   }
    // }

    // Fallback: usar created_at (string ISO)
    if (donation.created_at) {
      const parsed = new Date(donation.created_at);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  }

  /**
   * DEPRECATED - Ya no se usa porque payment_datetime viene como Date | string | null, no como array
   * Convierte el array de fecha que viene del backend [año, mes, día, hora, minuto, segundo]
   * a un objeto Date válido
   */
  // convertArrayToDate(dateArray: number[] | null): Date | null {
  //   if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return null;
  //
  //   // El mes en JavaScript es 0-indexed, por eso restamos 1
  //   return new Date(
  //     dateArray[0], // año
  //     dateArray[1] - 1, // mes (0-indexed)
  //     dateArray[2], // día
  //     dateArray[3] || 0, // hora
  //     dateArray[4] || 0, // minuto
  //     dateArray[5] || 0  // segundo
  //   );
  // }

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
  }
}
