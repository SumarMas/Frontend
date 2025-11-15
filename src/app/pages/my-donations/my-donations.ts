import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../components/button-component/button-component';
import { IconComponent } from '../../components/icon-component/icon-component';

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
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: './my-donations.html',
  styleUrl: './my-donations.scss'
})
export class MyDonations implements OnInit {
  donations = signal<DonationDto[]>([]);
  isLoading = signal<boolean>(true);
  totalDonated = signal<number>(0);

  // Datos mock
  mockDonations: DonationDto[] = [
    {
      donationId: '1',
      campaignTitle: 'Campaña de Invierno',
      campaignId: '11111',
      organizationName: 'Manos Abiertas',
      amount: 5000,
      donationDate: new Date('2024-10-15'),
      transactionId: 'TXN-2024-001234',
      status: 'COMPLETED',
      isAnonymous: false
    },
    {
      donationId: '2',
      campaignTitle: 'Comedor comunitario',
      campaignId: '22222',
      organizationName: 'Alimento para todos',
      amount: 3000,
      donationDate: new Date('2024-09-20'),
      transactionId: 'TXN-2024-001123',
      status: 'COMPLETED',
      isAnonymous: true
    },
    {
      donationId: '3',
      campaignTitle: 'Útiles escolares',
      campaignId: '33333',
      organizationName: 'Educación sin límites',
      amount: 2500,
      donationDate: new Date('2024-08-10'),
      transactionId: 'TXN-2024-000987',
      status: 'COMPLETED',
      isAnonymous: false
    },
    {
      donationId: '4',
      campaignTitle: 'Refugio animal',
      campaignId: '44444',
      organizationName: 'Patitas felices',
      amount: 10000,
      donationDate: new Date('2024-07-05'),
      transactionId: 'TXN-2024-000856',
      status: 'COMPLETED',
      isAnonymous: false
    }
  ];

  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations() {
    // Simular carga de datos
    setTimeout(() => {
      this.donations.set(this.mockDonations);
      this.calculateTotal();
      this.isLoading.set(false);
    }, 500);
  }

  calculateTotal() {
    const total = this.donations().reduce((sum, donation) => sum + donation.amount, 0);
    this.totalDonated.set(total);
  }

  getStatusClass(status: string): string {
    const classes = {
      'COMPLETED': 'badge-success',
      'PENDING': 'badge-warning',
      'FAILED': 'badge-error'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getStatusText(status: string): string {
    const texts = {
      'COMPLETED': 'Completada',
      'PENDING': 'Pendiente',
      'FAILED': 'Fallida'
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

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  }
}
