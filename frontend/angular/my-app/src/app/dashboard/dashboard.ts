import { isPlatformBrowser, NgClass, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DashboardService } from './services/dashboard';
import { DashboardStats } from './models/dashboard-stats';
import { BaseChartDirective } from 'ng2-charts';

import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  BarElement,
  BarController,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
  ChartConfiguration,
} from 'chart.js';

Chart.register(
  LineElement,
  PointElement,
  LineController,
  BarElement,
  BarController,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
);

type TrendDirection = 'positive' | 'negative' | 'neutral';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective, NgClass, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  stats?: DashboardStats;
  loading = true;
  errorMessage = '';

  private readonly purple = '#6c5ce7';
  private readonly purpleLight = 'rgba(108, 92, 231, 0.12)';
  private readonly warning = '#fdcb6e';
  private readonly pink = '#fd79a8';
  private readonly danger = '#d63031';
  private readonly grey = '#b2bec3';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStats();
    }
  }

  loadStats(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.updateCharts(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les données du dashboard.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Helpers statut ───────────────────────────────────────────

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      BROUILLON: 'Brouillon',
      EN_ATTENTE: 'En attente',
      EN_COURS: 'En cours',
      ACCEPTE: 'Accepté',
      REFUSE: 'Refusé',
      ANNULE: 'Annulé',
    };

    return labels[statut] ?? statut;
  }

  getStatutClass(statut: string): Record<string, boolean> {
    return {
      'bg-secondary': statut === 'BROUILLON',
      'bg-warning text-dark': statut === 'EN_ATTENTE',
      'bg-info text-dark': statut === 'EN_COURS',
      'bg-success': statut === 'ACCEPTE',
      'bg-danger': statut === 'REFUSE',
      'bg-dark': statut === 'ANNULE',
    };
  }

  // ─── Helpers évolution dashboard ──────────────────────────────

  getTrendDirection(
    value: number | null | undefined,
    higherIsBetter: boolean = true
  ): TrendDirection {
    if (value === null || value === undefined || value === 0) {
      return 'neutral';
    }

    if (this.isComparisonSuspiciousAtStartOfMonth(value)) {
      return 'neutral';
    }

    if (higherIsBetter) {
      return value > 0 ? 'positive' : 'negative';
    }

    return value > 0 ? 'negative' : 'positive';
  }

  getTrendLabel(
    value: number | null | undefined,
    higherIsBetter: boolean = true
  ): string {
    if (value === null || value === undefined) {
      return 'Comparaison indisponible';
    }

    if (this.isComparisonSuspiciousAtStartOfMonth(value)) {
      return 'Mois en cours';
    }

    if (value === 0) {
      return 'Stable vs mois dernier';
    }

    const absValue = this.formatPercent(Math.abs(value));
    const sign = value > 0 ? '+' : '-';

    return `${sign}${absValue} % vs mois dernier`;
  }

  getTrendClass(
    value: number | null | undefined,
    higherIsBetter: boolean = true
  ): Record<string, boolean> {
    const direction = this.getTrendDirection(value, higherIsBetter);

    return {
      'trend-positive': direction === 'positive',
      'trend-negative': direction === 'negative',
      'trend-neutral': direction === 'neutral',
    };
  }

  private isComparisonSuspiciousAtStartOfMonth(value: number): boolean {
    const today = new Date();
    const dayOfMonth = today.getDate();

    return dayOfMonth <= 7 && value <= -100;
  }

  private formatPercent(value: number): string {
    if (Number.isInteger(value)) {
      return value.toString();
    }

    return value.toFixed(2);
  }

  // ─── Line Chart : évolution du CA ─────────────────────────────

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'CA (€)',
        fill: true,
        tension: 0.4,
        borderColor: this.purple,
        backgroundColor: this.purpleLight,
        pointBackgroundColor: this.purple,
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} €`
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // ─── Bar Chart : devis par mois ───────────────────────────────

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Devis émis',
        backgroundColor: this.purple,
        borderColor: this.purple,
        borderRadius: 6,
        borderWidth: 1,
      }
    ]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} devis`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  // ─── Doughnut Chart : répartition des statuts ─────────────────

  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Accepté', 'En attente', 'En cours', 'Annulé', 'Refusé'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          this.purple,
          this.warning,
          this.pink,
          this.danger,
          this.grey,
        ],
        borderWidth: 0,
        hoverOffset: 8,
      }
    ]
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 12,
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 11 }
        }
      },
      tooltip: { enabled: true }
    }
  };

  doughnutPlugins: any[] = [
    {
      id: 'customDatalabels',
      afterDatasetsDraw(chart: any): void {
        const { ctx } = chart;

        chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
          const meta = chart.getDatasetMeta(datasetIndex);

          meta.data.forEach((element: any, index: number) => {
            const value = dataset.data[index];

            if (typeof value !== 'number' || value <= 0) return;

            const position = element.tooltipPosition(true);

            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value.toString(), position.x, position.y);
            ctx.restore();
          });
        });
      }
    }
  ];

  updateCharts(stats: DashboardStats): void {
    this.lineChartData = {
      labels: stats.moisLabels,
      datasets: [
        {
          data: stats.caParMois,
          label: 'CA (€)',
          fill: true,
          tension: 0.4,
          borderColor: this.purple,
          backgroundColor: this.purpleLight,
          pointBackgroundColor: this.purple,
        }
      ]
    };

    this.barChartData = {
      labels: stats.moisLabels,
      datasets: [
        {
          data: stats.devisParMois,
          label: 'Devis émis',
          backgroundColor: this.purple,
          borderColor: this.purple,
          borderRadius: 6,
          borderWidth: 1,
        }
      ]
    };

    this.doughnutChartData = {
      labels: ['Accepté', 'En attente', 'En cours', 'Annulé', 'Refusé'],
      datasets: [
        {
          data: [
            stats.devisAcceptes,
            stats.devisEnAttente,
            stats.devisEnCours,
            stats.devisAnnules,
            stats.devisRefuses
          ],
          backgroundColor: [
            this.purple,
            this.warning,
            this.pink,
            this.danger,
            this.grey,
          ],
          borderWidth: 0,
          hoverOffset: 8,
        }
      ]
    };
  }

  get totalDevis(): number {
    return this.stats?.totalDevis ?? 0;
  }
}