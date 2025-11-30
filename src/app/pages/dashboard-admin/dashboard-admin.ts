import { Component, OnInit, signal, AfterViewInit, PLATFORM_ID, inject, effect, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { CurrencyPipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { OrganizationService } from '../../services/api/organization-service';
import { CampaignService } from '../../services/api/campaign-service';
import { CategoryService } from '../../services/api/category-service';
import { forkJoin, map, of, catchError } from 'rxjs';
import { GetOrganizationDto } from '../../models/api/organization';
import { GetCampaignDto } from '../../models/api/campaign';
import { CategoryDto } from '../../models/api/category';

Chart.register(...registerables);

type DateFilter = '7d' | '30d' | '3m' | '1y';

interface NGOWithCampaigns {
  ngo: GetOrganizationDto;
  campaignCount: number;
  totalDonations: number;
}

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
  
  // Charts instances
  private ngosChart?: Chart;
  private donationsChart?: Chart;

  // Filtros
  selectedDateFilter = signal<DateFilter>('1y');
  
  dateFilterOptions = [
    { value: '7d' as DateFilter, label: 'Últimos 7 días' },
    { value: '30d' as DateFilter, label: 'Últimos 30 días' },
    { value: '3m' as DateFilter, label: 'Últimos 3 meses' },
    { value: '1y' as DateFilter, label: 'Último año' }
  ];

  // Estadísticas generales
  stats = signal({
    totalUsers: 0,
    newUsersWeek: 0,
    totalNGOs: 0,
    newNGOsWeek: 0,
    totalDonations: 0,
    totalAmount: 0,
    pendingPayouts: 0,
    approvedPayouts: 0
  });

  // Datos reales
  usersData = {
    total: 0,
    byRole: {
      USER: 0,
      NGO: 0,
      ADMIN: 0
    },
    newThisWeek: 0
  };

  ngosData = {
    total: 0,
    byStatus: {
      APPROVED: 0,
      PENDING: 0,
      REJECTED: 0
    },
    topByCampaigns: [] as { name: string; campaigns: number }[],
    topByDonations: [] as { name: string; amount: number }[]
  };

  donationsData = {
    total: 0,
    byStatus: {
      APPROVED: 0,
      PENDING: 0,
      REJECTED: 0
    },
    byCategory: {} as Record<string, number>,
    byPaymentMethod: {
      'Tarjeta de Crédito': 0,
      'Tarjeta de Débito': 0,
      Transferencia: 0
    },
    totalAmount: 0,
    payoutRequests: {
      PENDING: 0,
      APPROVED: 0
    },
    payoutAmounts: {
      PENDING: 0,
      APPROVED: 0
    }
  };

  isLoading = signal(true);

  constructor() {
    // Effect para reaccionar a cambios en el filtro
    effect(() => {
      const filter = this.selectedDateFilter();
      if (isPlatformBrowser(this.platformId)) {
        this.loadDashboardData();
      }
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  onFilterChange(filter: DateFilter): void {
    this.selectedDateFilter.set(filter);
  }

  private getDateLimitForFilter(filter: DateFilter): Date {
    const now = new Date();
    const limit = new Date(now);
    
    switch (filter) {
      case '7d':
        limit.setDate(now.getDate() - 7);
        break;
      case '30d':
        limit.setDate(now.getDate() - 30);
        break;
      case '3m':
        limit.setMonth(now.getMonth() - 3);
        break;
      case '1y':
        limit.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return limit;
  }

  private isWithinDateFilter(dateString: string | undefined): boolean {
    // Si no hay fecha, incluir el item (puede ser dato antiguo sin fecha)
    if (!dateString) return true;
    
    const itemDate = new Date(dateString);
    const dateLimit = this.getDateLimitForFilter(this.selectedDateFilter());
    
    return itemDate >= dateLimit;
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.createNGOsChart();
        this.createDonationsChart();
      }, 100);
    }
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    forkJoin({
      allNGOs: this.organizationService.getAllOrganizations(),
      closedCampaigns: this.campaignService.filter('CLOSED'),
      allCampaigns: this.campaignService.filter(), // Todas las campañas sin filtro de estado
      categories: this.categoryService.getAllCategories()
    }).subscribe({
      next: (data) => {
        // Filtrar organizaciones por fecha seleccionada
        const filteredNGOs = data.allNGOs.filter(ngo => 
          this.isWithinDateFilter(ngo.createdDateTime)
        );
        
        // Separar ONGs por estado (dentro del período filtrado)
        const approvedNGOs = filteredNGOs.filter(ngo => ngo.status === 'VERIFIED');
        const pendingNGOs = filteredNGOs.filter(ngo => ngo.status === 'PENDING');
        const deniedNGOs = filteredNGOs.filter(ngo => ngo.status === 'DENIED');
        
        // Filtrar campañas por fecha
        const filteredClosedCampaigns = data.closedCampaigns.filter(campaign => 
          this.isWithinDateFilter(campaign.create_date_time as string)
        );
        const filteredAllCampaigns = data.allCampaigns.filter(campaign => 
          this.isWithinDateFilter(campaign.create_date_time as string)
        );
        
        // Total de organizaciones en el período filtrado
        const totalNGOs = filteredNGOs.length;
        
        // ONGs por estado (en el período)
        this.ngosData.total = totalNGOs;
        this.ngosData.byStatus.APPROVED = approvedNGOs.length;
        this.ngosData.byStatus.PENDING = pendingNGOs.length;
        this.ngosData.byStatus.REJECTED = deniedNGOs.length;

        // Calcular recaudación total de campañas cerradas en el período
        const totalRecaudado = filteredClosedCampaigns.reduce((sum, campaign) => 
          sum + (campaign.current_amount || 0), 0
        );

        // Top 5 ONGs por cantidad de campañas (solo ONGs aprobadas, campañas filtradas por fecha)
        this.calculateTop5ByCampaigns(data.allNGOs.filter(ngo => ngo.status === 'VERIFIED'), filteredAllCampaigns);

        // Top 5 ONGs por volumen de donaciones (solo ONGs aprobadas, con filtro de fecha)
        this.calculateTop5ByDonations(data.allNGOs.filter(ngo => ngo.status === 'VERIFIED'), this.getDateLimitForFilter(this.selectedDateFilter()));

        // Recaudación por categoría (campañas cerradas filtradas)
        this.calculateRecaudacionByCategory(data.categories, filteredClosedCampaigns);

        // Actualizar stats
        this.stats.set({
          totalUsers: 0, // No hay endpoint
          newUsersWeek: 0, // No hay endpoint
          totalNGOs: totalNGOs,
          newNGOsWeek: totalNGOs, // ONGs en el período seleccionado
          totalDonations: 0, // Se calculará con donaciones
          totalAmount: totalRecaudado,
          pendingPayouts: 0, // Se puede calcular si hay endpoint
          approvedPayouts: 0 // Se puede calcular si hay endpoint
        });

        this.isLoading.set(false);
        this.recreateCharts();
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.isLoading.set(false);
      }
    });
  }

  private calculateTop5ByCampaigns(ngos: GetOrganizationDto[], activeCampaigns: GetCampaignDto[]): void {
    // Contar campañas por NGO
    const campaignsByNGO = new Map<string, number>();
    
    activeCampaigns.forEach(campaign => {
      const ngoId = campaign.ngo.ngoId;
      campaignsByNGO.set(ngoId, (campaignsByNGO.get(ngoId) || 0) + 1);
    });

    // Crear lista con nombre y cantidad de campañas
    const ngosWithCampaigns = ngos
      .map(ngo => ({
        name: ngo.name,
        campaigns: campaignsByNGO.get(ngo.ngoId) || 0
      }))
      .filter(item => item.campaigns > 0)
      .sort((a, b) => b.campaigns - a.campaigns)
      .slice(0, 5);

    this.ngosData.topByCampaigns = ngosWithCampaigns;
  }

  private calculateTop5ByDonations(ngos: GetOrganizationDto[], dateLimit: Date): void {
    // Para cada NGO, obtener sus campañas y sumar el current_amount
    // Esto evita llamar al endpoint de donaciones que está fallando con error 500
    const ngoObservables = ngos.map(ngo => 
      this.campaignService.filter(undefined, undefined, undefined, ngo.ngoId).pipe(
        map(campaigns => {
          // Filtrar campañas por fecha y sumar el current_amount
          const filteredCampaigns = campaigns.filter(campaign => {
            // Incluir campañas sin fecha
            if (!campaign.create_date_time) return true;
            const campaignDate = new Date(campaign.create_date_time);
            return campaignDate >= dateLimit;
          });
          
          const total = filteredCampaigns.reduce((sum, campaign) => sum + (campaign.current_amount || 0), 0);
          return {
            ngo,
            totalDonations: total
          };
        }),
        catchError(error => {
          console.error(`Error obteniendo campañas de NGO ${ngo.ngoId}:`, error);
          return of({ ngo, totalDonations: 0 });
        })
      )
    );

    // Procesar todas las ONGs aprobadas
    forkJoin(ngoObservables).subscribe({
      next: (results) => {
        this.ngosData.topByDonations = results
          .filter(r => r.totalDonations > 0)
          .sort((a, b) => b.totalDonations - a.totalDonations)
          .slice(0, 5)
          .map(r => ({
            name: r.ngo.name,
            amount: r.totalDonations
          }));
      },
      error: (error) => {
        console.error('Error al calcular top 5 por donaciones:', error);
        this.ngosData.topByDonations = [];
      }
    });
  }

  private calculateRecaudacionByCategory(categories: CategoryDto[], closedCampaigns: GetCampaignDto[]): void {
    const recaudacionByCategory: Record<string, number> = {};

    categories.forEach(category => {
      const campaignsInCategory = closedCampaigns.filter(campaign =>
        campaign.categories.some(cat => cat.id === category.id)
      );

      const total = campaignsInCategory.reduce((sum, campaign) => 
        sum + (campaign.current_amount || 0), 0
      );

      recaudacionByCategory[category.name] = total;
    });

    this.donationsData.byCategory = recaudacionByCategory;
  }

  private recreateCharts(): void {
    // Destruir gráficos existentes
    this.ngosChart?.destroy();
    this.donationsChart?.destroy();

    // Recrear con nuevos datos
    setTimeout(() => {
      this.createNGOsChart();
      this.createDonationsChart();
    }, 50);
  }

  private createUsersChart(): void {
    // Chart removido - no hay datos disponibles
  }

  private createNGOsChart(): void {
    const canvas = document.getElementById('ngosChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Verificadas', 'Pendientes', 'Denegadas'],
        datasets: [{
          label: 'ONGs por Estado',
          data: [
            this.ngosData.byStatus.APPROVED,
            this.ngosData.byStatus.PENDING,
            this.ngosData.byStatus.REJECTED
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // green - Verificadas
            'rgba(251, 191, 36, 0.8)',  // yellow - Pendientes
            'rgba(239, 68, 68, 0.8)'    // red - Denegadas
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
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.parsed.y} organizaciones`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 20
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.ngosChart = new Chart(canvas, config);
  }

  private createDonationsChart(): void {
    const canvas = document.getElementById('donationsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: Object.keys(this.donationsData.byCategory).map(cat => cat.replace('_', ' ')),
        datasets: [{
          label: 'Recaudación por Categoría',
          data: Object.values(this.donationsData.byCategory),
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(192, 132, 252, 0.8)',
            'rgba(216, 180, 254, 0.8)',
            'rgba(233, 213, 255, 0.8)',
            'rgba(245, 243, 255, 0.8)'
          ],
          borderColor: [
            'rgb(139, 92, 246)',
            'rgb(168, 85, 247)',
            'rgb(192, 132, 252)',
            'rgb(216, 180, 254)',
            'rgb(233, 213, 255)',
            'rgb(245, 243, 255)'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.x || 0;
                return `$${(value / 1000).toFixed(1)}K`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return `$${(Number(value) / 1000).toFixed(0)}K`;
              },
              stepSize: 500000
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.donationsChart = new Chart(canvas, config);
  }

  ngOnDestroy(): void {
    this.ngosChart?.destroy();
    this.donationsChart?.destroy();
  }
};

