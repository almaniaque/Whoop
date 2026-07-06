import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DashboardService } from '../../dashboard/services/dashboard';
import { DashboardStats } from '../../dashboard/models/dashboard-stats';
import { isPlatformBrowser, NgClass } from '@angular/common';

type TrendDirection = 'positive' | 'negative' | 'neutral';

@Component({
  selector: 'app-stat-card',
  imports: [NgClass],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})

export class StatCard implements OnInit {

  private dashboardService = inject(DashboardService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  stats?: DashboardStats;
  loading = true;
  errorMessage = '';

  get cumulDevisSixMois(): number {
    return (this.stats?.devisParMois ?? []).reduce((total, n) => total + n, 0);
  }

  // ─── Helpers évolution (mêmes règles que le dashboard) ─────────

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

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
      this.loadStats();
      console.log('ok navigateur');
    }
  }

  loadStats(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
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
}
