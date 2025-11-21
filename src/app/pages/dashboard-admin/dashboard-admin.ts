import { Component, OnInit, signal, AfterViewInit, PLATFORM_ID, inject, effect } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { CurrencyPipe } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

Chart.register(...registerables);

type DateFilter = '7d' | '30d' | '3m' | '1y';

@Component({
  selector: 'app-dashboard-admin',
  imports: [IconComponent, ButtonComponent, CurrencyPipe],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.scss'
})
export class DashboardAdmin implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  
  // Charts instances
  private usersChart?: Chart;
  private ngosChart?: Chart;
  private donationsChart?: Chart;

  // Filtros
  selectedDateFilter = signal<DateFilter>('30d');
  
  dateFilterOptions = [
    { value: '7d' as DateFilter, label: 'Últimos 7 días' },
    { value: '30d' as DateFilter, label: 'Últimos 30 días' },
    { value: '3m' as DateFilter, label: 'Últimos 3 meses' },
    { value: '1y' as DateFilter, label: 'Último año' }
  ];

  // Estadísticas generales
  stats = signal({
    totalUsers: 1245,
    newUsersWeek: 89,
    totalNGOs: 156,
    newNGOsWeek: 12,
    totalDonations: 3456,
    totalAmount: 45680000,
    pendingPayouts: 23,
    approvedPayouts: 134
  });

  constructor() {
    // Effect para reaccionar a cambios en el filtro
    effect(() => {
      const filter = this.selectedDateFilter();
      if (isPlatformBrowser(this.platformId)) {
        this.updateDataByFilter(filter);
      }
    });
  }

  // Mock data para usuarios
  usersData = {
    total: 1245,
    byRole: {
      USER: 1050,
      NGO: 180,
      ADMIN: 15
    },
    newThisWeek: 89
  };

  // Mock data para NGOs
  ngosData = {
    total: 156,
    byStatus: {
      APPROVED: 142,
      PENDING: 12,
      REJECTED: 2
    },
    topByCampaigns: [
      { name: 'Fundación Esperanza', campaigns: 8 },
      { name: 'Ayuda Solidaria', campaigns: 6 },
      { name: 'Manos Unidas', campaigns: 5 },
      { name: 'Corazón Solidario', campaigns: 4 },
      { name: 'Juntos por el Cambio', campaigns: 4 }
    ],
    topByDonations: [
      { name: 'Fundación Esperanza', amount: 8500000 },
      { name: 'Ayuda Solidaria', amount: 7200000 },
      { name: 'Manos Unidas', amount: 6800000 },
      { name: 'Corazón Solidario', amount: 5900000 },
      { name: 'Juntos por el Cambio', amount: 4500000 }
    ]
  };

  // Mock data para donaciones
  donationsData = {
    total: 3456,
    byStatus: {
      APPROVED: 3120,
      PENDING: 280,
      REJECTED: 56
    },
    byCategory: {
      Educación: 8900000,
      Salud: 7500000,
      Alimentación: 6800000,
      Vivienda: 5200000,
      Medio_Ambiente: 4100000,
      Otros: 3180000
    },
    byPaymentMethod: {
      'Tarjeta de Crédito': 25000000,
      'Tarjeta de Débito': 12000000,
      Transferencia: 8680000
    },
    totalAmount: 45680000,
    payoutRequests: {
      PENDING: 23,
      APPROVED: 134
    },
    payoutAmounts: {
      PENDING: 5800000,
      APPROVED: 32000000
    }
  };

  ngOnInit(): void {
    // Inicializar estadísticas
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.createUsersChart();
        this.createNGOsChart();
        this.createDonationsChart();
      }, 100);
    }
  }

  onFilterChange(filter: DateFilter): void {
    this.selectedDateFilter.set(filter);
  }

  private updateDataByFilter(filter: DateFilter): void {
    // Simular actualización de datos según el filtro
    const multiplier = this.getMultiplier(filter);
    
    // Actualizar stats
    this.stats.set({
      totalUsers: Math.floor(1245 * multiplier),
      newUsersWeek: Math.floor(89 * multiplier),
      totalNGOs: Math.floor(156 * multiplier),
      newNGOsWeek: Math.floor(12 * multiplier),
      totalDonations: Math.floor(3456 * multiplier),
      totalAmount: Math.floor(45680000 * multiplier),
      pendingPayouts: Math.floor(23 * multiplier),
      approvedPayouts: Math.floor(134 * multiplier)
    });

    // Actualizar datos de usuarios
    this.usersData = {
      total: Math.floor(1245 * multiplier),
      byRole: {
        USER: Math.floor(1050 * multiplier),
        NGO: Math.floor(180 * multiplier),
        ADMIN: 15
      },
      newThisWeek: Math.floor(89 * multiplier)
    };

    // Actualizar datos de NGOs
    this.ngosData.byStatus = {
      APPROVED: Math.floor(142 * multiplier),
      PENDING: Math.floor(12 * multiplier),
      REJECTED: Math.floor(2 * multiplier)
    };

    // Actualizar datos de donaciones
    const categoryMultiplier = this.getCategoryMultiplier(filter);
    this.donationsData.byCategory = {
      Educación: Math.floor(8900000 * categoryMultiplier),
      Salud: Math.floor(7500000 * categoryMultiplier),
      Alimentación: Math.floor(6800000 * categoryMultiplier),
      Vivienda: Math.floor(5200000 * categoryMultiplier),
      Medio_Ambiente: Math.floor(4100000 * categoryMultiplier),
      Otros: Math.floor(3180000 * categoryMultiplier)
    };

    // Recrear gráficos con nuevos datos
    this.recreateCharts();
  }

  private getMultiplier(filter: DateFilter): number {
    switch(filter) {
      case '7d': return 0.2;
      case '30d': return 1;
      case '3m': return 2.5;
      case '1y': return 4;
      default: return 1;
    }
  }

  private getCategoryMultiplier(filter: DateFilter): number {
    switch(filter) {
      case '7d': return 0.15;
      case '30d': return 1;
      case '3m': return 3;
      case '1y': return 5;
      default: return 1;
    }
  }

  private recreateCharts(): void {
    // Destruir gráficos existentes
    this.usersChart?.destroy();
    this.ngosChart?.destroy();
    this.donationsChart?.destroy();

    // Recrear con nuevos datos
    setTimeout(() => {
      this.createUsersChart();
      this.createNGOsChart();
      this.createDonationsChart();
    }, 50);
  }

  private createUsersChart(): void {
    const canvas = document.getElementById('usersChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Usuarios', 'ONGs', 'Administradores'],
        datasets: [{
          label: 'Usuarios por Rol',
          data: [
            this.usersData.byRole.USER,
            this.usersData.byRole.NGO,
            this.usersData.byRole.ADMIN
          ],
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',  // violet
            'rgba(168, 85, 247, 0.8)',  // purple
            'rgba(192, 132, 252, 0.8)'  // light purple
          ],
          borderColor: [
            'rgb(139, 92, 246)',
            'rgb(168, 85, 247)',
            'rgb(192, 132, 252)'
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
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = this.usersData.total;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.usersChart = new Chart(canvas, config);
  }

  private createNGOsChart(): void {
    const canvas = document.getElementById('ngosChart') as HTMLCanvasElement;
    if (!canvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Aprobadas', 'Pendientes', 'Rechazadas'],
        datasets: [{
          label: 'ONGs por Estado',
          data: [
            this.ngosData.byStatus.APPROVED,
            this.ngosData.byStatus.PENDING,
            this.ngosData.byStatus.REJECTED
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // green
            'rgba(251, 191, 36, 0.8)',  // yellow
            'rgba(239, 68, 68, 0.8)'    // red
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
                const value = context.parsed.x || 1;
                return `$${(value! / 1000000).toFixed(1)}M`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return `$${(Number(value) / 1000000).toFixed(0)}M`;
              }
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
    this.usersChart?.destroy();
    this.ngosChart?.destroy();
    this.donationsChart?.destroy();
  }
};

