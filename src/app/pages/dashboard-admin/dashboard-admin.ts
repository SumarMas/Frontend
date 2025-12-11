import { Component, OnInit, OnDestroy, signal, AfterViewInit, PLATFORM_ID, inject, effect } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { CurrencyPipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { OrganizationService } from '../../services/api/organization-service';
import { CampaignService } from '../../services/api/campaign-service';
import { CategoryService } from '../../services/api/category-service';
import { DonationService } from '../../services/api/donation-service';
import { forkJoin, of, catchError, map } from 'rxjs';
import { GetOrganizationDto } from '../../models/api/organization';
import { GetCampaignDto } from '../../models/api/campaign';
import { CategoryDto } from '../../models/api/category';
import { GetDonationDto } from '../../models/api/donation';

Chart.register(...registerables);

type DateFilter = '7d' | '30d' | '3m' | '1y';

@Component({
  selector: 'app-dashboard-admin',
  imports: [IconComponent, ButtonComponent, CurrencyPipe],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.scss'
})
export class DashboardAdmin implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private organizationService = inject(OrganizationService);
  private campaignService = inject(CampaignService);
  private categoryService = inject(CategoryService);
  private donationService = inject(DonationService);

  // ==================== DATOS CARGADOS UNA SOLA VEZ ====================
  private allNGOs: GetOrganizationDto[] = [];
  private allCampaigns: GetCampaignDto[] = [];
  private allCategories: CategoryDto[] = [];
  private allDonations: GetDonationDto[] = [];

  // ==================== ESTADO DE LA UI ====================
  isLoading = signal<boolean>(true);

  // ==================== FILTROS ====================
  selectedDateFilter = signal<DateFilter>('1y');

  dateFilterOptions = [
    { value: '7d' as DateFilter, label: 'Últimos 7 días' },
    { value: '30d' as DateFilter, label: 'Últimos 30 días' },
    { value: '3m' as DateFilter, label: 'Últimos 3 meses' },
    { value: '1y' as DateFilter, label: 'Último año' }
  ];

  // ==================== MÉTRICAS CALCULADAS ====================
  stats = signal({
    totalNGOs: 0,           // Total de ONGs (sin filtrar)
    ngosInPeriod: 0,        // ONGs creadas en el período
    totalCampaigns: 0,      // Total de campañas (sin filtrar)
    campaignsInPeriod: 0,   // Campañas creadas en el período
    activeCampaigns: 0,     // Campañas activas
    totalAmount: 0,         // Total recaudado en el período (de donaciones)
    totalDonations: 0       // Cantidad de donaciones en el período
  });

  // ONGs por estado (filtradas por fecha)
  ngosData = signal({
    verified: 0,
    pending: 0,
    denied: 0
  });

  // Campañas cerradas por tipo de cierre
  closedCampaignsData = signal({
    byGoal: 0,    // Cerraron porque alcanzaron la meta
    byDate: 0     // Cerraron porque llegó la fecha límite
  });

  // Datos para gráficos y tablas
  categoriesData: Record<string, number> = {};
  topNGOsByCampaigns: { name: string; count: number }[] = [];
  topNGOsByAmount: { name: string; amount: number }[] = [];

  get hasCategoriesData(): boolean {
    return Object.keys(this.categoriesData).length > 0 && 
           Object.values(this.categoriesData).some(v => v > 0);
  }

  // ==================== CHARTS ====================
  private ngosChart?: Chart;
  private categoriesChart?: Chart;
  private closedCampaignsChart?: Chart;

  constructor() {
    // Effect: cuando cambia el filtro, recalcular métricas
    effect(() => {
      const filter = this.selectedDateFilter();
      if (!this.isLoading() && isPlatformBrowser(this.platformId)) {
        this.recalculateMetrics();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.recreateCharts(), 200);
    }
  }

  ngOnDestroy(): void {
    this.ngosChart?.destroy();
    this.categoriesChart?.destroy();
    this.closedCampaignsChart?.destroy();
  }

  // ==================== CARGA INICIAL DE DATOS ====================
  private loadAllData(): void {
    this.isLoading.set(true);

    forkJoin({
      ngos: this.organizationService.getAllOrganizations().pipe(
        catchError(() => of([]))
      ),
      campaigns: this.campaignService.filter().pipe(
        catchError(() => of([]))
      ),
      categories: this.categoryService.getAllCategories().pipe(
        catchError(() => of([]))
      )
    }).subscribe({
      next: ({ ngos, campaigns, categories }) => {
        this.allNGOs = ngos;
        this.allCampaigns = campaigns;
        this.allCategories = categories;

        // Cargar donaciones de todas las campañas
        this.loadAllDonations(campaigns);
      },
      error: (error) => {
        console.error('Error loading admin dashboard data:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadAllDonations(campaigns: GetCampaignDto[]): void {
    if (campaigns.length === 0) {
      this.allDonations = [];
      this.recalculateMetrics();
      this.isLoading.set(false);
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.recreateCharts(), 100);
      }
      return;
    }

    // Cargar donaciones CONFIRMED y PAID de todas las campañas
    const donationRequests: ReturnType<typeof this.donationService.getDonationsByCampaign>[] = [];
    
    campaigns.forEach(campaign => {
      donationRequests.push(
        this.donationService.getDonationsByCampaign(campaign.id, 'CONFIRMED').pipe(
          catchError(() => of([]))
        )
      );
      donationRequests.push(
        this.donationService.getDonationsByCampaign(campaign.id, 'PAID').pipe(
          catchError(() => of([]))
        )
      );
    });

    forkJoin(donationRequests).pipe(
      map(arrays => arrays.flat())
    ).subscribe({
      next: (donations) => {
        this.allDonations = donations;
        this.recalculateMetrics();
        this.isLoading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.recreateCharts(), 100);
        }
      },
      error: () => {
        this.allDonations = [];
        this.recalculateMetrics();
        this.isLoading.set(false);
      }
    });
  }

  // ==================== RECÁLCULO DE MÉTRICAS ====================
  private recalculateMetrics(): void {
    const startDate = this.getStartDate(this.selectedDateFilter());

    // Filtrar NGOs por createdDateTime
    const filteredNGOs = this.filterNGOsByDate(this.allNGOs, startDate);

    // Filtrar campañas por create_date_time
    const filteredCampaigns = this.filterCampaignsByDate(this.allCampaigns, startDate);

    // Filtrar donaciones por fecha de pago
    const filteredDonations = this.filterDonationsByDate(this.allDonations, startDate);

    // ===== STATS GENERALES =====
    const activeCampaigns = this.allCampaigns.filter(c => 
      c.campaign_state?.toString().toUpperCase() === 'ACTIVE'
    ).length;

    // Total recaudado en el período (de donaciones filtradas por fecha)
    const validDonations = filteredDonations.filter(d => 
      d.status === 'PAID' || d.status === 'CONFIRMED'
    );
    const totalAmount = validDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalDonations = validDonations.length;

    this.stats.set({
      totalNGOs: this.allNGOs.length,
      ngosInPeriod: filteredNGOs.length,
      totalCampaigns: this.allCampaigns.length,
      campaignsInPeriod: filteredCampaigns.length,
      activeCampaigns,
      totalAmount,
      totalDonations
    });

    // ===== ONGs POR ESTADO =====
    this.ngosData.set({
      verified: filteredNGOs.filter(n => n.status === 'VERIFIED').length,
      pending: filteredNGOs.filter(n => n.status === 'PENDING').length,
      denied: filteredNGOs.filter(n => n.status === 'DENIED').length
    });

    // ===== CAMPAÑAS CERRADAS POR TIPO (filtradas por fecha de cierre) =====
    this.calculateClosedCampaignsData(startDate);

    // ===== RECAUDACIÓN POR CATEGORÍA (usando donaciones filtradas) =====
    this.calculateCategoriesData(filteredDonations);

    // ===== TOP 5 ONGs POR CAMPAÑAS =====
    this.calculateTopNGOsByCampaigns(filteredCampaigns);

    // ===== TOP 5 ONGs POR RECAUDACIÓN (usando donaciones filtradas) =====
    this.calculateTopNGOsByAmount(filteredDonations);

    // Recrear gráficos
    if (isPlatformBrowser(this.platformId)) {
      this.recreateCharts();
    }
  }

  private calculateCategoriesData(filteredDonations: GetDonationDto[]): void {
    const result: Record<string, number> = {};

    this.allCategories.forEach(category => {
      // Campañas que tienen esta categoría
      const campaignsWithCategory = this.allCampaigns.filter(c =>
        c.categories?.some(cat => cat.id === category.id)
      );

      // IDs de campañas con esta categoría
      const campaignIds = campaignsWithCategory.map(c => c.id);

      // Sumar donaciones filtradas que pertenecen a estas campañas
      const total = filteredDonations
        .filter(d => campaignIds.includes(d.campaign_id) && (d.status === 'PAID' || d.status === 'CONFIRMED'))
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      result[category.name] = total;
    });

    this.categoriesData = result;
  }

  private calculateTopNGOsByCampaigns(filteredCampaigns: GetCampaignDto[]): void {
    // Contar campañas por NGO
    const countByNGO = new Map<string, { name: string; count: number }>();

    filteredCampaigns.forEach(campaign => {
      const ngoId = campaign.ngo?.ngoId;
      const ngoName = campaign.ngo?.name || 'Desconocido';
      
      if (ngoId) {
        const current = countByNGO.get(ngoId) || { name: ngoName, count: 0 };
        current.count++;
        countByNGO.set(ngoId, current);
      }
    });

    this.topNGOsByCampaigns = Array.from(countByNGO.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateTopNGOsByAmount(filteredDonations: GetDonationDto[]): void {
    // Crear un mapa de campaña a NGO
    const campaignToNGO = new Map<string, { ngoId: string; name: string }>();
    this.allCampaigns.forEach(c => {
      if (c.ngo?.ngoId) {
        campaignToNGO.set(c.id, { ngoId: c.ngo.ngoId, name: c.ngo.name || 'Desconocido' });
      }
    });

    // Sumar monto de donaciones por NGO
    const amountByNGO = new Map<string, { name: string; amount: number }>();

    filteredDonations
      .filter(d => d.status === 'PAID' || d.status === 'CONFIRMED')
      .forEach(donation => {
        const ngoInfo = campaignToNGO.get(donation.campaign_id);
        if (ngoInfo) {
          const current = amountByNGO.get(ngoInfo.ngoId) || { name: ngoInfo.name, amount: 0 };
          current.amount += donation.amount || 0;
          amountByNGO.set(ngoInfo.ngoId, current);
        }
      });

    this.topNGOsByAmount = Array.from(amountByNGO.values())
      .filter(n => n.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  private calculateClosedCampaignsData(startDate: Date): void {
    const now = new Date();
    
    // Obtener campañas cerradas
    const closedCampaigns = this.allCampaigns.filter(c => 
      c.campaign_state?.toString().toUpperCase() === 'CLOSED'
    );

    let byGoal = 0;
    let byDate = 0;

    closedCampaigns.forEach(campaign => {
      const goalAmount = campaign.goal_amount || 0;
      const currentAmount = campaign.current_amount || 0;
      const endDate = this.parseDate(campaign.end_date_time);

      // Determinar la fecha de cierre de la campaña
      // Si alcanzó la meta, la fecha de cierre es cuando se alcanzó la meta
      // Si no alcanzó la meta, la fecha de cierre es la fecha límite (end_date_time)
      let closedDate: Date | null = null;

      // Si alcanzó o superó la meta, cerró por meta
      if (currentAmount >= goalAmount && goalAmount > 0) {
        // Verificar si alcanzó la meta ANTES de la fecha límite
        const campaignDonations = this.allDonations
          .filter(d => d.campaign_id === campaign.id && (d.status === 'PAID' || d.status === 'CONFIRMED'))
          .sort((a, b) => {
            const dateA = this.parseDate(a.payment_datetime) || this.parseDate(a.created_at);
            const dateB = this.parseDate(b.payment_datetime) || this.parseDate(b.created_at);
            if (!dateA || !dateB) return 0;
            return dateA.getTime() - dateB.getTime();
          });

        // Calcular cuándo se alcanzó la meta
        let runningTotal = 0;
        let goalReachedDate: Date | null = null;

        for (const donation of campaignDonations) {
          runningTotal += donation.amount || 0;
          if (runningTotal >= goalAmount && !goalReachedDate) {
            goalReachedDate = this.parseDate(donation.payment_datetime) || this.parseDate(donation.created_at);
            break;
          }
        }

        closedDate = goalReachedDate || endDate;

        // Filtrar por fecha: solo contar si se cerró dentro del período
        if (closedDate && closedDate >= startDate && closedDate <= now) {
          if (goalReachedDate && (!endDate || goalReachedDate <= endDate)) {
            byGoal++;
          } else {
            byDate++;
          }
        }
      } else {
        // No alcanzó la meta, cerró por fecha
        closedDate = endDate;
        
        // Filtrar por fecha: solo contar si se cerró dentro del período
        if (closedDate && closedDate >= startDate && closedDate <= now) {
          byDate++;
        }
      }
    });

    this.closedCampaignsData.set({ byGoal, byDate });
  }

  // ==================== UTILIDADES DE FECHA ====================
  private getStartDate(filter: DateFilter): Date {
    const now = new Date();
    switch (filter) {
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3m': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
  }

  private parseDate(date: Date | string | number[] | null | undefined): Date | null {
    if (!date) return null;

    if (date instanceof Date && !isNaN(date.getTime())) {
      return date;
    }

    if (Array.isArray(date)) {
      if (date.length < 3) return null;
      return new Date(
        date[0],
        date[1] - 1,
        date[2],
        date[3] || 0,
        date[4] || 0,
        date[5] || 0
      );
    }

    if (typeof date === 'string') {
      const normalizedDate = date.replace(' ', 'T');
      const parsed = new Date(normalizedDate);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  }

  private filterNGOsByDate(ngos: GetOrganizationDto[], startDate: Date): GetOrganizationDto[] {
    const now = new Date();
    return ngos.filter(n => {
      const createdDate = this.parseDate(n.createdDateTime);
      if (!createdDate) return true;
      return createdDate >= startDate && createdDate <= now;
    });
  }

  private filterCampaignsByDate(campaigns: GetCampaignDto[], startDate: Date): GetCampaignDto[] {
    const now = new Date();
    return campaigns.filter(c => {
      const createdDate = this.parseDate(c.create_date_time);
      if (!createdDate) return true;
      return createdDate >= startDate && createdDate <= now;
    });
  }

  private filterDonationsByDate(donations: GetDonationDto[], startDate: Date): GetDonationDto[] {
    const now = new Date();
    return donations.filter(d => {
      // Usar payment_datetime si existe, sino created_at
      const donationDate = this.parseDate(d.payment_datetime) || this.parseDate(d.created_at);
      if (!donationDate) return true;
      return donationDate >= startDate && donationDate <= now;
    });
  }

  // ==================== EVENTOS DE UI ====================
  onFilterChange(filter: DateFilter): void {
    this.selectedDateFilter.set(filter);
  }

  // ==================== GRÁFICOS ====================
  private recreateCharts(): void {
    if (this.ngosChart) {
      this.ngosChart.destroy();
      this.ngosChart = undefined;
    }
    if (this.categoriesChart) {
      this.categoriesChart.destroy();
      this.categoriesChart = undefined;
    }
    if (this.closedCampaignsChart) {
      this.closedCampaignsChart.destroy();
      this.closedCampaignsChart = undefined;
    }

    setTimeout(() => {
      this.createNGOsChart();
      this.createCategoriesChart();
      this.createClosedCampaignsChart();
    }, 100);
  }

  private createNGOsChart(): void {
    const canvas = document.getElementById('ngosChart') as HTMLCanvasElement;
    if (!canvas) return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const data = this.ngosData();

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Verificadas', 'Pendientes', 'Denegadas'],
        datasets: [{
          label: 'ONGs por Estado',
          data: [data.verified, data.pending, data.denied],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(251, 191, 36)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.y} organizaciones`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    };

    this.ngosChart = new Chart(canvas, config);
  }

  private createCategoriesChart(): void {
    const canvas = document.getElementById('categoriesChart') as HTMLCanvasElement;
    if (!canvas) return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const labels = Object.keys(this.categoriesData);
    const values = Object.values(this.categoriesData);

    const colors = [
      'rgba(139, 92, 246, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(192, 132, 252, 0.8)',
      'rgba(216, 180, 254, 0.8)',
      'rgba(233, 213, 255, 0.8)',
      'rgba(124, 58, 237, 0.8)'
    ];

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels.map(l => l.replace('_', ' ')),
        datasets: [{
          label: 'Recaudación',
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(c => c.replace('0.8', '1')),
          borderWidth: 2,
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
              label: (ctx) => {
                const value = ctx.parsed.x || 0;
                return value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toFixed(0)}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (v) => {
                const num = Number(v);
                return num >= 1000 ? `$${(num / 1000).toFixed(0)}K` : `$${num}`;
              }
            },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          y: { grid: { display: false } }
        }
      }
    };

    this.categoriesChart = new Chart(canvas, config);
  }

  private createClosedCampaignsChart(): void {
    const canvas = document.getElementById('closedCampaignsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const data = this.closedCampaignsData();
    const total = data.byGoal + data.byDate;

    if (total === 0) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Alcanzaron la Meta', 'Finalizaron por Fecha'],
        datasets: [{
          data: [data.byGoal, data.byDate],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(251, 191, 36)'
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
            labels: {
              padding: 20,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${ctx.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.closedCampaignsChart = new Chart(canvas, config);
  }
}

