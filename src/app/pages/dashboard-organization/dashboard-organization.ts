import { Component, OnInit, signal, AfterViewInit, PLATFORM_ID, inject, effect } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

Chart.register(...registerables);

type DateFilter = '7d' | '30d' | '3m' | '1y';

interface Campaign {
  id: string;
  name: string;
}

@Component({
  selector: 'app-dashboard-organization',
  imports: [IconComponent, ButtonComponent, CurrencyPipe, DatePipe],
  templateUrl: './dashboard-organization.html',
  styleUrl: './dashboard-organization.scss'
})
export class DashboardOrganization implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  
  // Charts instances
  private campaignProgressChart?: Chart;
  private dailyDonationsChart?: Chart;
  private donationsByCategoryChart?: Chart;
  private donationsByStatusChart?: Chart;
  private paymentMethodChart?: Chart;

  // Filtros
  selectedDateFilter = signal<DateFilter>('30d');
  selectedCampaign = signal<string>('all');
  
  dateFilterOptions = [
    { value: '7d' as DateFilter, label: 'Últimos 7 días' },
    { value: '30d' as DateFilter, label: 'Últimos 30 días' },
    { value: '3m' as DateFilter, label: 'Últimos 3 meses' },
    { value: '1y' as DateFilter, label: 'Último año' }
  ];

  campaigns = signal<Campaign[]>([
    { id: 'all', name: 'Todas las campañas' },
    { id: 'camp-1', name: 'Educación para Todos' },
    { id: 'camp-2', name: 'Salud Comunitaria' },
    { id: 'camp-3', name: 'Alimentos Solidarios' },
    { id: 'camp-4', name: 'Viviendas Dignas' }
  ]);

  // Estadísticas generales
  stats = signal({
    totalDonations: 487,
    totalAmount: 12450000,
    activeCampaigns: 4,
    avgDonation: 25565,
    pendingPayouts: 3,
    approvedPayouts: 18,
    topDonor: 'Juan Pérez',
    topDonorAmount: 450000
  });

  // Datos de campaña activa
  campaignData = {
    name: 'Educación para Todos',
    goal: 5000000,
    raised: 3200000,
    daysActive: 45,
    daysLimit: 90,
    donationsCount: 156,
    progress: 64
  };

  // Donaciones por día (últimos 30 días)
  dailyDonationsData = {
    labels: [] as string[],
    amounts: [] as number[]
  };

  // Donaciones por categoría
  donationsByCategoryData = {
    Educación: 4200000,
    Salud: 3100000,
    Alimentación: 2800000,
    Vivienda: 2350000
  };

  // Donaciones por estado
  donationsByStatusData = {
    APPROVED: 425,
    PENDING: 48,
    REJECTED: 14
  };

  // Medios de pago
  paymentMethodData = {
    'Tarjeta de Crédito': 7200000,
    'Tarjeta de Débito': 3450000,
    'Transferencia': 1800000
  };

  // Órdenes de pago
  payoutData = {
    byStatus: {
      PENDING: 3,
      APPROVED: 18
    },
    byAmount: {
      PENDING: 850000,
      APPROVED: 8600000
    }
  };

  constructor() {
    // Effect para reaccionar a cambios en filtros
    effect(() => {
      const dateFilter = this.selectedDateFilter();
      const campaign = this.selectedCampaign();
      if (isPlatformBrowser(this.platformId)) {
        this.updateDataByFilters(dateFilter, campaign);
      }
    });
  }

  ngOnInit(): void {
    this.generateDailyData();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.createCampaignProgressChart();
        this.createDailyDonationsChart();
        this.createDonationsByCategoryChart();
        this.createDonationsByStatusChart();
        this.createPaymentMethodChart();
      }, 100);
    }
  }

  onDateFilterChange(filter: DateFilter): void {
    this.selectedDateFilter.set(filter);
  }

  onCampaignChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCampaign.set(select.value);
  }

  private generateDailyData(): void {
    const days = 30;
    const labels: string[] = [];
    const amounts: number[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      amounts.push(Math.floor(Math.random() * 150000) + 50000);
    }

    this.dailyDonationsData = { labels, amounts };
  }

  private updateDataByFilters(dateFilter: DateFilter, campaignId: string): void {
    const multiplier = this.getMultiplier(dateFilter);
    const campaignMultiplier = campaignId === 'all' ? 1 : 0.25;
    
    // Actualizar stats
    this.stats.set({
      totalDonations: Math.floor(487 * multiplier * campaignMultiplier),
      totalAmount: Math.floor(12450000 * multiplier * campaignMultiplier),
      activeCampaigns: campaignId === 'all' ? 4 : 1,
      avgDonation: Math.floor(25565 * multiplier),
      pendingPayouts: Math.floor(3 * multiplier),
      approvedPayouts: Math.floor(18 * multiplier),
      topDonor: 'Juan Pérez',
      topDonorAmount: Math.floor(450000 * multiplier)
    });

    // Actualizar datos de campaña
    this.campaignData.raised = Math.floor(3200000 * multiplier * campaignMultiplier);
    this.campaignData.donationsCount = Math.floor(156 * multiplier * campaignMultiplier);
    this.campaignData.progress = Math.floor((this.campaignData.raised / this.campaignData.goal) * 100);

    // Actualizar categorías
    Object.keys(this.donationsByCategoryData).forEach(key => {
      const baseValue = key === 'Educación' ? 4200000 : key === 'Salud' ? 3100000 : key === 'Alimentación' ? 2800000 : 2350000;
      (this.donationsByCategoryData as any)[key] = Math.floor(baseValue * multiplier * campaignMultiplier);
    });

    // Actualizar estados
    this.donationsByStatusData = {
      APPROVED: Math.floor(425 * multiplier * campaignMultiplier),
      PENDING: Math.floor(48 * multiplier * campaignMultiplier),
      REJECTED: Math.floor(14 * multiplier * campaignMultiplier)
    };

    // Generar datos diarios según filtro
    this.generateDailyDataByFilter(dateFilter);

    // Recrear gráficos
    this.recreateCharts();
  }

  private generateDailyDataByFilter(filter: DateFilter): void {
    const days = filter === '7d' ? 7 : filter === '30d' ? 30 : filter === '3m' ? 90 : 365;
    const labels: string[] = [];
    const amounts: number[] = [];
    const today = new Date();

    const step = days > 90 ? 7 : days > 30 ? 3 : 1; // Agrupar datos si es mucho tiempo
    
    for (let i = days - 1; i >= 0; i -= step) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      amounts.push(Math.floor(Math.random() * 150000) + 50000);
    }

    this.dailyDonationsData = { labels, amounts };
  }

  private getMultiplier(filter: DateFilter): number {
    switch(filter) {
      case '7d': return 0.25;
      case '30d': return 1;
      case '3m': return 2.8;
      case '1y': return 5;
      default: return 1;
    }
  }

  private recreateCharts(): void {
    this.campaignProgressChart?.destroy();
    this.dailyDonationsChart?.destroy();
    this.donationsByCategoryChart?.destroy();
    this.donationsByStatusChart?.destroy();
    this.paymentMethodChart?.destroy();

    setTimeout(() => {
      this.createCampaignProgressChart();
      this.createDailyDonationsChart();
      this.createDonationsByCategoryChart();
      this.createDonationsByStatusChart();
      this.createPaymentMethodChart();
    }, 50);
  }

  private createCampaignProgressChart(): void {
    const canvas = document.getElementById('campaignProgressChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Recaudado', 'Faltante'],
        datasets: [{
          data: [this.campaignData.raised, this.campaignData.goal - this.campaignData.raised],
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(229, 231, 235, 0.5)'
          ],
          borderColor: [
            'rgb(139, 92, 246)',
            'rgb(229, 231, 235)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 10, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                return `$${(value / 1000000).toFixed(1)}M`;
              }
            }
          }
        }
      }
    };

    this.campaignProgressChart = new Chart(canvas, config);
  }

  private createDailyDonationsChart(): void {
    const canvas = document.getElementById('dailyDonationsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.dailyDonationsData.labels,
        datasets: [{
          label: 'Recaudación Diaria',
          data: this.dailyDonationsData.amounts,
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `$${context.parsed.y?.toLocaleString('es-AR')}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${(Number(value) / 1000).toFixed(0)}k`
            },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    };

    this.dailyDonationsChart = new Chart(canvas, config);
  }

  private createDonationsByCategoryChart(): void {
    const canvas = document.getElementById('donationsByCategoryChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: Object.keys(this.donationsByCategoryData),
        datasets: [{
          label: 'Recaudación',
          data: Object.values(this.donationsByCategoryData),
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(192, 132, 252, 0.8)',
            'rgba(216, 180, 254, 0.8)'
          ],
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `$${((context.parsed.y || 1) / 1000000).toFixed(1)}M`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${(Number(value) / 1000000).toFixed(0)}M`
            },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    };

    this.donationsByCategoryChart = new Chart(canvas, config);
  }

  private createDonationsByStatusChart(): void {
    const canvas = document.getElementById('donationsByStatusChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Aprobadas', 'Pendientes', 'Rechazadas'],
        datasets: [{
          data: Object.values(this.donationsByStatusData),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 10, font: { size: 11 } }
          }
        }
      }
    };

    this.donationsByStatusChart = new Chart(canvas, config);
  }

  private createPaymentMethodChart(): void {
    const canvas = document.getElementById('paymentMethodChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: Object.keys(this.paymentMethodData),
        datasets: [{
          label: 'Monto',
          data: Object.values(this.paymentMethodData),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(168, 85, 247, 0.8)'
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `$${((context.parsed.x || 1) / 1000000).toFixed(1)}M`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${(Number(value) / 1000000).toFixed(0)}M`
            },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          y: { grid: { display: false } }
        }
      }
    };

    this.paymentMethodChart = new Chart(canvas, config);
  }

  ngOnDestroy(): void {
    this.campaignProgressChart?.destroy();
    this.dailyDonationsChart?.destroy();
    this.donationsByCategoryChart?.destroy();
    this.donationsByStatusChart?.destroy();
    this.paymentMethodChart?.destroy();
  }
}
