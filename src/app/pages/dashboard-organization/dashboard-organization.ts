import { Component, OnInit, OnDestroy, signal, AfterViewInit, PLATFORM_ID, inject, effect } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { OrganizationService } from '../../services/api/organization-service';
import { CampaignService } from '../../services/api/campaign-service';
import { DonationService } from '../../services/api/donation-service';
import { PayoutService } from '../../services/api/payout-service';
import { CategoryService } from '../../services/api/category-service';
import { forkJoin, map, switchMap, of, catchError } from 'rxjs';
import { GetCampaignDto } from '../../models/api/campaign';
import { GetDonationDto } from '../../models/api/donation';
import { GetOrganizationDto } from '../../models/api/organization';
import { PayoutDto } from '../../models/api/payouts';
import { CategoryDto } from '../../models/api/category';

Chart.register(...registerables);

type DateFilter = '7d' | '30d' | '3m' | '1y';

@Component({
  selector: 'app-dashboard-organization',
  imports: [IconComponent, ButtonComponent, CurrencyPipe, DatePipe],
  templateUrl: './dashboard-organization.html',
  styleUrl: './dashboard-organization.scss'
})
export class DashboardOrganization implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private organizationService = inject(OrganizationService);
  private campaignService = inject(CampaignService);
  private donationService = inject(DonationService);
  private payoutService = inject(PayoutService);
  private categoryService = inject(CategoryService);

  // ==================== DATOS CARGADOS UNA SOLA VEZ ====================
  private myOrganization?: GetOrganizationDto;
  private allCampaigns: GetCampaignDto[] = [];
  private allDonations: GetDonationDto[] = [];
  private allPayouts: PayoutDto[] = [];
  private allCategories: CategoryDto[] = [];

  // ==================== ESTADO DE LA UI ====================
  isLoading = signal<boolean>(true);
  organizationName = signal<string>('Mi Organización');

  // ==================== FILTROS ====================
  selectedDateFilter = signal<DateFilter>('1y');
  selectedCampaignId = signal<string>('');

  dateFilterOptions = [
    { value: '7d' as DateFilter, label: 'Últimos 7 días' },
    { value: '30d' as DateFilter, label: 'Últimos 30 días' },
    { value: '3m' as DateFilter, label: 'Últimos 3 meses' },
    { value: '1y' as DateFilter, label: 'Último año' }
  ];

  campaignOptions = signal<{ id: string; name: string }[]>([]);

  // ==================== MÉTRICAS CALCULADAS ====================
  // Stats de la organización (filtrados por fecha)
  stats = signal({
    totalDonations: 0,      // count(donations) en el período
    totalAmount: 0,         // sum(donations.amount) en el período
    avgDonation: 0,         // totalAmount / totalDonations
    activeCampaigns: 0,     // campañas con state=ACTIVE
    totalCampaigns: 0,      // todas las campañas
    pendingPayouts: 0,      // payouts con status=PENDING
    approvedPayouts: 0      // payouts con status=APPROVED
  });

  // Datos de la campaña seleccionada
  campaignData = signal({
    name: 'Sin campaña seleccionada',
    goal: 0,
    raised: 0,              // Total recaudado (current_amount - siempre)
    raisedInPeriod: 0,      // Recaudado en el período (de donaciones)
    donationsCount: 0,      // Donaciones en el período
    donationsCountTotal: 0, // Donaciones totales (estimadas)
    progress: 0,
    startDate: null as Date | null,  // Fecha de inicio
    daysRemaining: 0,
    state: '' as 'ACTIVE' | 'CLOSED' | ''
  });

  // Datos para gráficos y tablas
  categoriesData: Record<string, number> = {};
  topCampaigns: { name: string; amount: number; donationsCount: number }[] = [];
  
  // Datos de donaciones por día de la semana para la campaña seleccionada
  weeklyDonationsData = signal<number[]>([0, 0, 0, 0, 0, 0, 0]);

  get hasCategoriesData(): boolean {
    return Object.keys(this.categoriesData).length > 0;
  }

  // ==================== CHARTS ====================
  private campaignProgressChart?: Chart;
  private categoriesChart?: Chart;

  constructor() {
    // Effect: cuando cambia el filtro de fecha, recalcular métricas
    effect(() => {
      const dateFilter = this.selectedDateFilter();
      const campaignId = this.selectedCampaignId();
      
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
    this.campaignProgressChart?.destroy();
    this.categoriesChart?.destroy();
  }

  // ==================== CARGA INICIAL DE DATOS ====================
  private loadAllData(): void {
    this.isLoading.set(true);

    // 1. Obtener mi organización
    this.organizationService.getMyOrganizations().pipe(
      catchError(error => {
        console.error('Error getting organization:', error);
        throw error;
      }),
      switchMap(org => {
        this.myOrganization = org;
        this.organizationName.set(org.name);

        // 2. Cargar en paralelo: campañas, categorías, payouts
        return forkJoin({
          campaigns: this.campaignService.filter(undefined, undefined, undefined, org.ngoId).pipe(
            catchError(() => of([]))
          ),
          categories: this.categoryService.getAllCategories().pipe(
            catchError(() => of([]))
          ),
          payouts: this.payoutService.getMyPayouts().pipe(
            catchError(() => of([]))
          )
        });
      }),
      switchMap(({ campaigns, categories, payouts }) => {
        this.allCampaigns = campaigns;
        this.allCategories = categories;
        this.allPayouts = payouts;

        // Configurar opciones del selector de campañas
        this.campaignOptions.set(campaigns.map(c => ({ id: c.id, name: c.title })));
        
        // Seleccionar primera campaña por defecto
        if (campaigns.length > 0) {
          this.selectedCampaignId.set(campaigns[0].id);
        }

        // 3. Cargar donaciones de todas las campañas en paralelo
        // El backend requiere el parámetro status
        // Cargamos tanto CONFIRMED como PAID para tener todas las donaciones completadas
        if (campaigns.length === 0) {
          return of([]);
        }

        const donationRequests: ReturnType<typeof this.donationService.getDonationsByCampaign>[] = [];
        
        campaigns.forEach(campaign => {
          // Cargar donaciones CONFIRMED
          donationRequests.push(
            this.donationService.getDonationsByCampaign(campaign.id, 'CONFIRMED').pipe(
              catchError(() => of([]))
            )
          );
          // Cargar donaciones PAID
          donationRequests.push(
            this.donationService.getDonationsByCampaign(campaign.id, 'PAID').pipe(
              catchError(() => of([]))
            )
          );
        });

        return forkJoin(donationRequests).pipe(
          map(arrays => arrays.flat())
        );
      }),
      catchError(error => {
        console.error('Error loading data:', error);
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe({
      next: (donations) => {
        this.allDonations = donations;

        this.recalculateMetrics();
        this.isLoading.set(false);

        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.recreateCharts(), 100);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  // ==================== RECÁLCULO DE MÉTRICAS (cuando cambia filtro) ====================
  private recalculateMetrics(): void {
    const dateFilter = this.selectedDateFilter();
    const startDate = this.getStartDate(dateFilter);

    // Filtrar donaciones por fecha (created_at como referencia)
    const filteredDonations = this.filterDonationsByDate(this.allDonations, startDate);

    // Filtrar payouts por fecha (request_datetime)
    const filteredPayouts = this.filterPayoutsByDate(this.allPayouts, startDate);

    // ===== STATS DE LA ORGANIZACIÓN (FILTRADAS POR PERÍODO) =====
    // Donaciones válidas: CONFIRMED o PAID
    const validDonations = filteredDonations.filter(d => 
      d.status === 'PAID' || d.status === 'CONFIRMED'
    );
    
    const totalDonations = validDonations.length;
    
    // Total recaudado en el período (de donaciones filtradas)
    const totalAmount = validDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    // Promedio: total / donaciones
    const avgDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

    const activeCampaigns = this.allCampaigns.filter(c => 
      c.campaign_state?.toString().toUpperCase() === 'ACTIVE'
    ).length;

    const pendingPayouts = filteredPayouts.filter(p => p.status === 'PENDING').length;
    const approvedPayouts = filteredPayouts.filter(p => p.status === 'APPROVED').length;

    this.stats.set({
      totalDonations,
      totalAmount,
      avgDonation,
      activeCampaigns,
      totalCampaigns: this.allCampaigns.length,
      pendingPayouts,
      approvedPayouts
    });

    // ===== DATOS DE LA CAMPAÑA SELECCIONADA =====
    this.updateCampaignData(filteredDonations);

    // ===== DONACIONES POR DÍA DE LA SEMANA (CAMPAÑA SELECCIONADA) =====
    this.calculateWeeklyDonations(filteredDonations);

    // ===== RECAUDACIÓN POR CATEGORÍA =====
    this.calculateCategoriesData(filteredDonations);

    // ===== TOP 5 CAMPAÑAS (filtrar campañas por fecha, con TODAS sus donaciones) =====
    this.calculateTopCampaigns(startDate);

    // Recrear gráficos con nuevos datos
    if (isPlatformBrowser(this.platformId)) {
      this.recreateCharts();
    }
  }

  private updateCampaignData(filteredDonations: GetDonationDto[]): void {
    const campaignId = this.selectedCampaignId();
    const campaign = this.allCampaigns.find(c => c.id === campaignId);

    if (!campaign) {
      this.campaignData.set({
        name: 'Sin campaña seleccionada',
        goal: 0,
        raised: 0,
        raisedInPeriod: 0,
        donationsCount: 0,
        donationsCountTotal: 0,
        progress: 0,
        startDate: null,
        daysRemaining: 0,
        state: ''
      });
      return;
    }

    // IMPORTANTE: Usar current_amount de la campaña como fuente principal
    // Es el dato más confiable del backend
    const raised = campaign.current_amount || 0;
    const goal = campaign.goal_amount || 0;
    const progress = goal > 0 ? Math.min(Math.floor((raised / goal) * 100), 100) : 0;

    // Donaciones de esta campaña en el período (para mostrar actividad del período)
    const campaignDonations = filteredDonations.filter(d => 
      d.campaign_id === campaign.id && (d.status === 'PAID' || d.status === 'CONFIRMED')
    );
    const raisedInPeriod = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const donationsCount = campaignDonations.length;

    // Todas las donaciones de esta campaña (sin filtro de fecha)
    const allCampaignDonations = this.allDonations.filter(d => 
      d.campaign_id === campaign.id && (d.status === 'PAID' || d.status === 'CONFIRMED')
    );
    const donationsCountTotal = allCampaignDonations.length;

    this.campaignData.set({
      name: campaign.title,
      goal,
      raised,
      raisedInPeriod,
      donationsCount,
      donationsCountTotal,
      progress,
      startDate: this.parseDate(campaign.create_date_time),
      daysRemaining: this.calculateDaysRemaining(campaign.end_date_time),
      state: campaign.campaign_state || ''
    });
  }

  private calculateCategoriesData(filteredDonations: GetDonationDto[]): void {
    const result: Record<string, number> = {};

    this.allCategories.forEach(category => {
      // Campañas que tienen esta categoría
      const campaignsWithCategory = this.allCampaigns.filter(c =>
        c.categories?.some(cat => cat.id === category.id || cat.name === category.name)
      );

      // IDs de campañas con esta categoría
      const campaignIds = campaignsWithCategory.map(c => c.id);

      // Sumar donaciones filtradas que pertenecen a estas campañas
      const total = filteredDonations
        .filter(d => campaignIds.includes(d.campaign_id) && (d.status === 'PAID' || d.status === 'CONFIRMED'))
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      if (total > 0) {
        result[category.name] = total;
      }
    });

    this.categoriesData = result;
  }

  private calculateWeeklyDonations(filteredDonations: GetDonationDto[]): void {
    const campaignId = this.selectedCampaignId();
    
    // Inicializar array para cada día de la semana (Lun=0, ..., Dom=6)
    const amounts = [0, 0, 0, 0, 0, 0, 0];

    // Filtrar donaciones de la campaña seleccionada
    const campaignDonations = filteredDonations.filter(d => 
      d.campaign_id === campaignId && (d.status === 'PAID' || d.status === 'CONFIRMED')
    );

    campaignDonations.forEach(donation => {
      // Usar payment_datetime o created_at
      const date = this.parseDate(donation.payment_datetime) || this.parseDate(donation.created_at);
      if (date) {
        // getDay() retorna 0=Domingo, 1=Lunes, ..., 6=Sábado
        // Convertir a 0=Lunes, ..., 6=Domingo
        let dayIndex = date.getDay() - 1;
        if (dayIndex < 0) dayIndex = 6; // Domingo pasa a índice 6
        
        amounts[dayIndex] += donation.amount || 0;
      }
    });

    this.weeklyDonationsData.set(amounts);
  }

  private calculateTopCampaigns(startDate: Date): void {
    // Filtrar campañas creadas dentro del período seleccionado
    const filteredCampaigns = this.allCampaigns.filter(c => {
      const createdDate = this.parseDate(c.create_date_time);
      if (!createdDate) return true; // Incluir si no tiene fecha
      return createdDate >= startDate;
    });

    const campaignTotals = filteredCampaigns.map(campaign => {
      // Usar TODAS las donaciones de esta campaña (sin filtro de fecha)
      const campaignDonations = this.allDonations.filter(d => 
        d.campaign_id === campaign.id && (d.status === 'PAID' || d.status === 'CONFIRMED')
      );
      
      // Sumar el monto total de donaciones
      const amount = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      
      return {
        name: campaign.title,
        amount,
        donationsCount: campaignDonations.length
      };
    });

    this.topCampaigns = campaignTotals
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
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

    // Si ya es un Date válido
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date;
    }

    // Si es un array de números [año, mes, día, hora, min, seg]
    if (Array.isArray(date)) {
      if (date.length < 3) return null;
      return new Date(
        date[0],
        date[1] - 1, // mes 0-indexed
        date[2],
        date[3] || 0,
        date[4] || 0,
        date[5] || 0
      );
    }

    // Si es string, intentar parsear
    if (typeof date === 'string') {
      // Reemplazar espacio por T para formato ISO estándar
      // "2025-11-21 22:08:37" -> "2025-11-21T22:08:37"
      const normalizedDate = date.replace(' ', 'T');
      const parsed = new Date(normalizedDate);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  }

  private filterDonationsByDate(donations: GetDonationDto[], startDate: Date): GetDonationDto[] {
    return donations.filter(d => {
      // Usar created_at como fecha principal (cuándo se hizo la donación)
      // payment_datetime es cuándo se procesó el pago, puede tener timestamps desfasados
      let dateToCheck = this.parseDate(d.created_at);
      if (!dateToCheck) {
        dateToCheck = this.parseDate(d.payment_datetime);
      }
      // Si no tiene ninguna fecha, incluirla (para no perder datos)
      if (!dateToCheck) return true;
      // Solo verificar que la donación sea posterior al inicio del período
      return dateToCheck >= startDate;
    });
  }

  private filterPayoutsByDate(payouts: PayoutDto[], startDate: Date): PayoutDto[] {
    return payouts.filter(p => {
      const requestDate = this.parseDate(p.request_datetime);
      if (!requestDate) return true; // Incluir si no tiene fecha
      return requestDate >= startDate;
    });
  }

  private calculateDaysRemaining(endDate: Date | string | number[] | null | undefined): number {
    const end = this.parseDate(endDate);
    if (!end) return 0;

    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  // ==================== EVENTOS DE UI ====================
  onDateFilterChange(filter: DateFilter): void {
    this.selectedDateFilter.set(filter);
  }

  onCampaignChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCampaignId.set(select.value);
  }

  // ==================== GRÁFICOS ====================
  private recreateCharts(): void {
    // Destruir charts existentes completamente
    if (this.campaignProgressChart) {
      this.campaignProgressChart.destroy();
      this.campaignProgressChart = undefined;
    }
    if (this.categoriesChart) {
      this.categoriesChart.destroy();
      this.categoriesChart = undefined;
    }

    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      this.createCampaignProgressChart();
      this.createCategoriesChart();
    }, 100);
  }

  private createCampaignProgressChart(): void {
    const canvas = document.getElementById('campaignProgressChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Asegurar que no haya chart existente
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const weeklyData = this.weeklyDonationsData();
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Monto recaudado',
            data: weeklyData,
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: 'rgb(139, 92, 246)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed.y ?? 0;
                return value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toFixed(0)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Monto ($)', font: { size: 10 } },
            ticks: { font: { size: 9 } }
          },
          x: {
            title: { display: true, text: 'Día', font: { size: 10 } },
            ticks: { font: { size: 10 } }
          }
        }
      }
    };

    this.campaignProgressChart = new Chart(canvas, config);
  }

  private createCategoriesChart(): void {
    const canvas = document.getElementById('categoriesChart') as HTMLCanvasElement;
    if (!canvas || !this.hasCategoriesData) return;

    // Asegurar que no haya chart existente
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
}
