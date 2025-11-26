import { Component, OnInit, signal, AfterViewInit, PLATFORM_ID, inject, effect } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { CurrencyPipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { OrganizationService } from '../../services/api/organization-service';
import { CampaignService } from '../../services/api/campaign-service';
import { DonationService } from '../../services/api/donation-service';
import { PayoutService } from '../../services/api/payout-service';
import { forkJoin, map, switchMap, of, catchError } from 'rxjs';
import { GetCampaignDto, CampaignState } from '../../models/api/campaign';
import { GetDonationDto } from '../../models/api/donation';
import { GetOrganizationDto } from '../../models/api/organization';
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
  private organizationService = inject(OrganizationService);
  private campaignService = inject(CampaignService);
  private donationService = inject(DonationService);
  private payoutService = inject(PayoutService);
  
  // Data from API
  private myOrganization?: GetOrganizationDto;
  private allCampaigns: GetCampaignDto[] = [];
  private allDonations: GetDonationDto[] = []; // Todas las donaciones de la organización
  private selectedCampaignDonations: GetDonationDto[] = []; // Donaciones de la campaña seleccionada
  private allPayouts: PayoutDto[] = []; // Todos los payouts de la organización
  
  isLoading = signal<boolean>(true);
  organizationName = signal<string>('Mi Organización'); // Nombre de la organización
  
  // Charts instances
  private campaignProgressChart?: Chart;

  // Filtros
  selectedDateFilter = signal<DateFilter>('30d');
  selectedCampaign = signal<string>(''); // Vacío hasta que se carguen las campañas
  
  dateFilterOptions = [
    { value: '7d' as DateFilter, label: 'Últimos 7 días' },
    { value: '30d' as DateFilter, label: 'Últimos 30 días' },
    { value: '3m' as DateFilter, label: 'Últimos 3 meses' },
    { value: '1y' as DateFilter, label: 'Último año' }
  ];

  campaigns = signal<Campaign[]>([
    { id: '', name: 'Seleccione una campaña...' }
  ]);

  // Estadísticas generales
  stats = signal({
    totalDonations: 0,
    totalAmount: 0,
    activeCampaigns: 0,
    avgDonation: 0,
    pendingPayouts: 0,
    approvedPayouts: 0,
    campaignsWithDonations: 0
  });

  // Datos de campaña activa
  campaignData = {
    name: 'Cargando...',
    goal: 0,
    raised: 0,
    daysActive: 0,
    daysLimit: 0,
    donationsCount: 0,
    progress: 0
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
    
    // 1. Obtener la organización del usuario autenticado
    this.organizationService.getMyOrganizations().pipe(
      catchError(error => {
        console.error('Error getting organization:', error);
        this.isLoading.set(false);
        throw error;
      }),
      switchMap(organization => {
        this.myOrganization = organization;
        this.organizationName.set(organization.name); // Actualizar nombre de la organización
        
        // 2. Obtener todas las campañas de la NGO (sin filtro de estado)
        return this.campaignService.filter(undefined, undefined, undefined, organization.ngoId).pipe(
          catchError(error => {
            console.error('Error getting campaigns:', error);
            return of([]);
          })
        );
      }),
      switchMap(campaigns => {
        this.allCampaigns = campaigns;
        console.log('Loaded campaigns:', campaigns.map(c => ({
          id: c.id, 
          title: c.title, 
          state: c.campaign_state,
          current: c.current_amount,
          goal: c.goal_amount
        })));
        
        // Construir lista de campañas para el filtro
        const campaignOptions: Campaign[] = [
          { id: '', name: 'Seleccione una campaña...' }, // Placeholder deshabilitado
          ...campaigns.map(c => ({ id: c.id, name: c.title }))
        ];
        this.campaigns.set(campaignOptions);
        
        // Seleccionar la primera campaña real por defecto
        if (campaigns.length > 0) {
          this.selectedCampaign.set(campaigns[0].id);
        }
        
        // 3. Obtener donaciones de todas las campañas en paralelo
        if (campaigns.length === 0) {
          return of([]);
        }
        
        const donationRequests = campaigns.map(campaign =>
          this.donationService.getDonationsByCampaign(campaign.id).pipe(
            catchError(error => {
              console.error(`Error getting donations for campaign ${campaign.title}:`, error);
              return of([]);
            })
          )
        );
        
        return forkJoin(donationRequests).pipe(
          map(donationArrays => donationArrays.flat())
        );
      }),
      switchMap(allDonations => {
        this.allDonations = allDonations;
        console.log('Loaded total donations:', allDonations.length);
        
        // 4. Cargar payouts de la organización
        return this.payoutService.getMyPayouts().pipe(
          catchError(error => {
            console.error('Error getting payouts:', error);
            return of([]);
          }),
          map(payouts => ({ allDonations, payouts }))
        );
      }),
      catchError(error => {
        console.error('Error in loadDashboardData:', error);
        this.isLoading.set(false);
        return of({ allDonations: [], payouts: [] });
      })
    ).subscribe({
      next: ({ allDonations, payouts }) => {
        this.allDonations = allDonations;
        this.allPayouts = payouts;
        console.log('Loaded total payouts:', payouts.length);
        
        // Calcular estadísticas globales de la organización
        this.calculateGlobalStats();
        
        // Calcular datos de la campaña seleccionada
        this.updateSelectedCampaignData();
        
        // Recrear gráficos
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.recreateCharts(), 100);
        }
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading.set(false);
      }
    });
  }

  // Calcula estadísticas GLOBALES de toda la organización (no cambian con filtros)
  private calculateGlobalStats(): void {
    console.log('calculateGlobalStats - Total campaigns:', this.allCampaigns.length);
    console.log('calculateGlobalStats - Total donations from API:', this.allDonations.length);
    
    // Si no tenemos donaciones del API, calculamos desde current_amount de las campañas
    let totalDonations = 0;
    let totalAmount = 0;
    let avgDonation = 0;
    let campaignsWithDonations = 0;
    
    if (this.allDonations.length > 0) {
      // Opción 1: Tenemos donaciones del API
      const confirmedDonations = this.allDonations.filter(d => d.status === 'CONFIRMED');
      totalDonations = confirmedDonations.length;
      totalAmount = confirmedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      avgDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
      
      const campaignIdsWithDonations = new Set(confirmedDonations.map(d => d.campaign_id));
      campaignsWithDonations = campaignIdsWithDonations.size;
    } else {
      // Opción 2: API devuelve 500, usamos current_amount de las campañas
      console.log('Using campaign current_amount as fallback');
      totalAmount = this.allCampaigns.reduce((sum, c) => sum + (c.current_amount || 0), 0);
      campaignsWithDonations = this.allCampaigns.filter(c => (c.current_amount || 0) > 0).length;
      
      // Estimamos número de donaciones (asumiendo promedio de $500 por donación)
      totalDonations = totalAmount > 0 ? Math.round(totalAmount / 500) : 0;
      avgDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
    }
    
    // Campañas activas
    const activeCampaigns = this.allCampaigns.filter(c => 
      c.campaign_state?.toString().toUpperCase() === 'ACTIVE'
    ).length;
    
    // Calcular payouts pendientes y aprobados
    const pendingPayouts = this.allPayouts.filter(p => p.status === 'PENDING').length;
    const approvedPayouts = this.allPayouts.filter(p => p.status === 'APPROVED').length;
    
    this.stats.set({
      totalDonations,
      totalAmount,
      activeCampaigns,
      avgDonation,
      pendingPayouts,
      approvedPayouts,
      campaignsWithDonations
    });
    
    console.log('Global stats:', this.stats());
  }
  
  // Actualiza los datos de la campaña seleccionada (card grande)
  private updateSelectedCampaignData(): void {
    const selectedCampaignId = this.selectedCampaign();
    console.log('updateSelectedCampaignData - Selected campaign ID:', selectedCampaignId);
    
    let campaign: GetCampaignDto | undefined;
    
    if (selectedCampaignId && selectedCampaignId !== '') {
      // Buscar campaña específica
      campaign = this.allCampaigns.find(c => c.id === selectedCampaignId);
      console.log('Found campaign:', campaign?.title);
    } else {
      // Si no hay campaña seleccionada (placeholder), mostrar la primera
      campaign = this.allCampaigns[0];
      console.log('Using first campaign:', campaign?.title);
    }
    
    if (!campaign) {
      console.warn('No campaign found');
      return;
    }
    
    // Filtrar donaciones de esta campaña específica
    const campaignDonations = this.allDonations.filter(d => d.campaign_id === campaign!.id);
    const confirmedDonations = campaignDonations.filter(d => d.status === 'CONFIRMED');
    
    console.log('Campaign donations:', campaignDonations.length, 'confirmed:', confirmedDonations.length);
    
    // Si no tenemos donaciones del API, estimamos desde current_amount
    let donationsCount = confirmedDonations.length;
    if (donationsCount === 0 && (campaign.current_amount || 0) > 0) {
      // Estimación: asumimos promedio de $500 por donación
      donationsCount = Math.round((campaign.current_amount || 0) / 500);
      console.log('Estimated donations:', donationsCount, 'from amount:', campaign.current_amount);
    }
    
    this.campaignData = {
      name: campaign.title,
      goal: campaign.goal_amount || 0,
      raised: campaign.current_amount || 0,
      daysActive: this.calculateDaysActive(campaign.create_date_time),
      daysLimit: this.calculateDaysLimit(campaign.end_date_time, campaign.create_date_time),
      donationsCount: donationsCount,
      progress: Math.min(Math.floor(((campaign.current_amount || 0) / (campaign.goal_amount || 1)) * 100), 100)
    };
    
    console.log('Updated campaignData:', this.campaignData);
  }
  
  
  private calculateDaysActive(create_date_time: Date | string | null | undefined): number {
    // Calcula cuántos días han pasado desde la creación de la campaña hasta hoy
    if (!create_date_time) {
      return 0;
    }
    const created = new Date(create_date_time);
    if (isNaN(created.getTime())) {
      console.warn('Invalid create_date_time:', create_date_time);
      return 0;
    }
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }
  
  private calculateDaysLimit(end_date_time: Date | string | null | undefined, create_date_time?: Date | string | null | undefined): number {
    // Calcula el total de días que la campaña estaba programada para estar activa
    // (desde create_date_time hasta end_date_time)
    if (!end_date_time || !create_date_time) {
      return 0;
    }
    const created = new Date(create_date_time);
    const end = new Date(end_date_time);
    if (isNaN(created.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid dates:', { create_date_time, end_date_time });
      return 0;
    }
    const diff = end.getTime() - created.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days); // Total de días programados
  }
  
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.createCampaignProgressChart();
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

  private updateDataByFilters(dateFilter: DateFilter, campaignId: string): void {
    console.log('updateDataByFilters - dateFilter:', dateFilter, 'campaignId:', campaignId);
    
    // Filtrar donaciones por fecha
    const filteredDonations = this.filterDonationsByDate(this.allDonations, dateFilter);
    console.log('Filtered donations:', filteredDonations.length, 'from total:', this.allDonations.length);
    
    // Recalcular stats globales con donaciones filtradas
    this.calculateGlobalStatsFromDonations(filteredDonations);
    
    // Actualizar datos de campaña seleccionada con donaciones filtradas
    this.updateSelectedCampaignDataFromDonations(filteredDonations);
    
    this.recreateCharts();
  }
  
  private filterDonationsByDate(donations: GetDonationDto[], dateFilter: DateFilter): GetDonationDto[] {
    const now = new Date();
    let startDate: Date;
    
    switch (dateFilter) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return donations; // Sin filtro
    }
    
    return donations.filter(donation => {
      if (!donation.payment_datetime) return false;
      
      // Manejar diferentes formatos de fecha
      let paymentDate: Date;
      if (Array.isArray(donation.payment_datetime)) {
        // Array de números [año, mes, día, hora, minuto, segundo]
        if (donation.payment_datetime.length < 3) return false;
        paymentDate = new Date(
          donation.payment_datetime[0], // año
          donation.payment_datetime[1] - 1, // mes (0-indexed)
          donation.payment_datetime[2], // día
          donation.payment_datetime[3] || 0, // hora
          donation.payment_datetime[4] || 0, // minuto
          donation.payment_datetime[5] || 0  // segundo
        );
      } else {
        // String o Date
        paymentDate = new Date(donation.payment_datetime);
      }
      
      return paymentDate >= startDate && paymentDate <= now;
    });
  }
  
  private calculateGlobalStatsFromDonations(donations: GetDonationDto[]): void {
    const confirmedDonations = donations.filter(d => d.status === 'CONFIRMED');
    
    let totalDonations = confirmedDonations.length;
    let totalAmount = confirmedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    let avgDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
    
    // Si no hay donaciones del API, usar current_amount de campañas (sin filtro de fecha)
    if (totalDonations === 0 && this.allCampaigns.length > 0) {
      console.log('No donations in filter range, using campaign current_amount');
      totalAmount = this.allCampaigns.reduce((sum, c) => sum + (c.current_amount || 0), 0);
      totalDonations = totalAmount > 0 ? Math.round(totalAmount / 500) : 0;
      avgDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
    }
    
    const campaignIdsWithDonations = new Set(confirmedDonations.map(d => d.campaign_id));
    const campaignsWithDonations = campaignIdsWithDonations.size || this.allCampaigns.filter(c => (c.current_amount || 0) > 0).length;
    
    const activeCampaigns = this.allCampaigns.filter(c => 
      c.campaign_state?.toString().toUpperCase() === 'ACTIVE'
    ).length;
    
    // Calcular payouts pendientes y aprobados (no cambian con filtro de fecha)
    const pendingPayouts = this.allPayouts.filter(p => p.status === 'PENDING').length;
    const approvedPayouts = this.allPayouts.filter(p => p.status === 'APPROVED').length;
    
    this.stats.set({
      totalDonations,
      totalAmount,
      activeCampaigns,
      avgDonation,
      pendingPayouts,
      approvedPayouts,
      campaignsWithDonations
    });
  }
  
  private updateSelectedCampaignDataFromDonations(filteredDonations: GetDonationDto[]): void {
    const selectedCampaignId = this.selectedCampaign();
    
    let campaign: GetCampaignDto | undefined;
    
    if (selectedCampaignId && selectedCampaignId !== '') {
      campaign = this.allCampaigns.find(c => c.id === selectedCampaignId);
    } else {
      campaign = this.allCampaigns[0];
    }
    
    if (!campaign) return;
    
    // Filtrar donaciones de esta campaña específica
    const campaignDonations = filteredDonations.filter(d => d.campaign_id === campaign!.id);
    const confirmedDonations = campaignDonations.filter(d => d.status === 'CONFIRMED');
    
    // Calcular total recaudado en el período filtrado
    let raised = confirmedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    let donationsCount = confirmedDonations.length;
    
    // Si no hay donaciones del API, usar current_amount de la campaña
    if (donationsCount === 0) {
      raised = campaign.current_amount || 0;
      donationsCount = raised > 0 ? Math.round(raised / 500) : 0;
    }
    
    this.campaignData = {
      name: campaign.title,
      goal: campaign.goal_amount || 0,
      raised: raised,
      daysActive: this.calculateDaysActive(campaign.create_date_time),
      daysLimit: this.calculateDaysLimit(campaign.end_date_time, campaign.create_date_time),
      donationsCount: donationsCount,
      progress: Math.min(Math.floor((raised / (campaign.goal_amount || 1)) * 100), 100)
    };
  }

  private recreateCharts(): void {
    this.campaignProgressChart?.destroy();

    setTimeout(() => {
      this.createCampaignProgressChart();
    }, 50);
  }

  private createCampaignProgressChart(): void {
    const canvas = document.getElementById('campaignProgressChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Calcular recaudado y faltante correctamente
    const raised = this.campaignData.raised;
    const goal = this.campaignData.goal;
    const remaining = Math.max(0, goal - raised); // No puede ser negativo
    
    // Si superó la meta, mostrar 100% recaudado
    const chartData = raised >= goal 
      ? [goal, 0] // Meta completa, sin faltante
      : [raised, remaining]; // Recaudado y faltante

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Recaudado', 'Faltante'],
        datasets: [{
          data: chartData,
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
                // Formatear en miles (K)
                if (value >= 1000) {
                  return `$${(value / 1000).toFixed(1)}K`;
                }
                return `$${value.toFixed(0)}`;
              }
            }
          }
        }
      }
    };

    this.campaignProgressChart = new Chart(canvas, config);
  }



  ngOnDestroy(): void {
    this.campaignProgressChart?.destroy();
  }
}
