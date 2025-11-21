import { Component, OnInit, signal, AfterViewInit, PLATFORM_ID, inject, effect } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { CurrencyPipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { CampaignService } from '../../services/api/campaign-service';
import { PayoutService } from '../../services/api/payout-service';
import { DonationService } from '../../services/api/donation-service';
import { forkJoin } from 'rxjs';
import { GetCampaignDto } from '../../models/api/campaign';
import { GetDonationDto } from '../../models/api/donation';
import { PayoutDto } from '../../models/api/payouts';

Chart.register(...registerables);

type DateFilter = '7d' | '30d' | '3m' | '1y';

interface Campaign {
  id: string;
  name: string;
}

@Component({
  selector: 'app-dashboard-organization',
  imports: [IconComponent, ButtonComponent, CurrencyPipe],
  templateUrl: './dashboard-organization.html',
  styleUrl: './dashboard-organization.scss'
})
export class DashboardOrganization implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private campaignService = inject(CampaignService);
  private payoutService = inject(PayoutService);
  private donationService = inject(DonationService);
  
  // Data from API
  private allCampaigns: GetCampaignDto[] = [];
  private allDonations: GetDonationDto[] = [];
  private allPayouts: PayoutDto[] = [];
  
  isLoading = signal<boolean>(true);
  
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
      if (isPlatformBrowser(this.platformId) && !this.isLoading()) {
        this.updateDataByFilters(dateFilter, campaign);
      }
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    forkJoin({
      availableData: this.payoutService.getAvailableDonations(),
      payouts: this.payoutService.getMyPayouts()
    }).subscribe({
      next: ({ availableData, payouts }) => {
        // Las campaigns vienen desde available donations con sus donaciones
        this.allCampaigns = availableData.campaigns.map(c => ({
          id: c.id,
          ngo: {} as any,
          title: c.name,
          goal_amount: c.goal,
          current_amount: c.totalReceipt,
          description: '',
          endDateTime: new Date(),
          createDateTime: new Date(),
          end_date_time: new Date(),
          create_date_time: new Date(),
          campaign_state: 'ACTIVE' as 'ACTIVE' | 'CLOSED',
          categories: [],
          tags: [],
          images: []
        }));

        // Extraer todas las donaciones de todas las campañas
        // No tenemos acceso directo a las donaciones, solo a los totales
        this.allDonations = [];
        this.allPayouts = payouts;

        // Construir lista de campañas para el filtro
        const campaignOptions: Campaign[] = [
          { id: 'all', name: 'Todas las campañas' },
          ...availableData.campaigns.map(c => ({ id: c.id, name: c.name }))
        ];
        this.campaigns.set(campaignOptions);

        // Calcular estadísticas desde available data
        this.calculateStatsFromAvailableData(availableData, payouts);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading.set(false);
      }
    });
  }

  private calculateStatsFromAvailableData(availableData: any, payouts: PayoutDto[]): void {
    const selectedCampaignId = this.selectedCampaign();

    // Filtrar campañas según selección
    const filteredCampaigns = selectedCampaignId === 'all'
      ? availableData.campaigns
      : availableData.campaigns.filter((c: any) => c.id === selectedCampaignId);

    // Calcular totales
    const totalDonations = filteredCampaigns.reduce((sum: number, c: any) => sum + c.totalDonations, 0);
    const totalAmount = filteredCampaigns.reduce((sum: number, c: any) => sum + c.totalReceipt, 0);
    const avgDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
    const activeCampaigns = filteredCampaigns.length;

    // Contar payouts
    const pendingPayouts = payouts.filter(p => p.status === 'PENDING').length;
    const approvedPayouts = payouts.filter(p => p.status === 'APPROVED').length;

    this.stats.set({
      totalDonations,
      totalAmount,
      activeCampaigns,
      avgDonation,
      pendingPayouts,
      approvedPayouts,
      topDonor: 'N/A',
      topDonorAmount: 0
    });

    // Actualizar datos de campaña
    if (filteredCampaigns.length > 0) {
      const campaign = filteredCampaigns[0];
      this.campaignData = {
        name: campaign.name,
        goal: campaign.goal,
        raised: campaign.totalReceipt,
        daysActive: 30, // No tenemos esta info
        daysLimit: 90,  // No tenemos esta info
        donationsCount: campaign.totalDonations,
        progress: Math.min(Math.floor((campaign.totalReceipt / campaign.goal) * 100), 100)
      };
    }

    // Generar datos mock para gráficos (ya que no tenemos detalle)
    this.generateMockChartData(filteredCampaigns);

    // Actualizar datos de payouts
    this.updatePayoutData(payouts);

    // Recrear gráficos si ya están inicializados
    if (this.campaignProgressChart) {
      this.recreateCharts();
    }
  }

  private generateMockChartData(campaigns: any[]): void {
    const totalAmount = campaigns.reduce((sum: any, c: any) => sum + c.totalReceipt, 0);

    // Generar datos diarios mock basados en el total
    const days = 30;
    const labels: string[] = [];
    const amounts: number[] = [];
    const today = new Date();
    const dailyAvg = totalAmount / days;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      // Variar ±30% del promedio
      const variation = dailyAvg * (0.7 + Math.random() * 0.6);
      amounts.push(Math.floor(variation));
    }

    this.dailyDonationsData = { labels, amounts };

    // Distribuir por categorías mock
    const categories = ['Educación', 'Salud', 'Alimentación', 'Vivienda'];
    const categoryData: any = {};
    categories.forEach((cat, index) => {
      const percentage = [0.35, 0.30, 0.20, 0.15][index];
      categoryData[cat] = Math.floor(totalAmount * percentage);
    });
    this.donationsByCategoryData = categoryData;

    // Estados mock (90% aprobadas, 7% pendientes, 3% rechazadas)
    const totalDonations = campaigns.reduce((sum: any, c: any) => sum + c.totalDonations, 0);
    this.donationsByStatusData = {
      APPROVED: Math.floor(totalDonations * 0.90),
      PENDING: Math.floor(totalDonations * 0.07),
      REJECTED: Math.floor(totalDonations * 0.03)
    };

    // Medios de pago mock
    this.paymentMethodData = {
      'Tarjeta de Crédito': Math.floor(totalAmount * 0.60),
      'Tarjeta de Débito': Math.floor(totalAmount * 0.25),
      'Transferencia': Math.floor(totalAmount * 0.15)
    };
  }

  private updatePayoutData(payouts: PayoutDto[]): void {
    const pending = payouts.filter(p => p.status === 'PENDING');
    const approved = payouts.filter(p => p.status === 'APPROVED');

    this.payoutData = {
      byStatus: {
        PENDING: pending.length,
        APPROVED: approved.length
      },
      byAmount: {
        PENDING: pending.reduce((sum, p) => sum + p.amount, 0),
        APPROVED: approved.reduce((sum, p) => sum + p.amount, 0)
      }
    };
  }

  private calculateStats(): void {
    // Recargar datos con los filtros actuales
    forkJoin({
      availableData: this.payoutService.getAvailableDonations(),
      payouts: this.payoutService.getMyPayouts()
    }).subscribe({
      next: ({ availableData, payouts }) => {
        this.allPayouts = payouts;
        
        // Actualizar campañas
        this.allCampaigns = availableData.campaigns.map(c => ({
          id: c.id,
          ngo: {} as any,
          title: c.name,
          goal_amount: c.goal,
          current_amount: c.totalReceipt,
          description: '',
          endDateTime: new Date(),
          createDateTime: new Date(),
          end_date_time: new Date(),
          create_date_time: new Date(),
          campaign_state: 'ACTIVE' as 'ACTIVE' | 'CLOSED',
          categories: [],
          tags: [],
          images: []
        }));

        this.calculateStatsFromAvailableData(availableData, payouts);
      }
    });
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
    this.calculateStats();
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
