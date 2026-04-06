import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild, AfterViewInit, Output, EventEmitter, inject, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import moment from 'moment-timezone';
import { DashboardService } from 'src/app/services/dashboard.service';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PosComponent } from 'src/app/business/components/pos/pos.component';
import { Subject, takeUntil } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-sales-analytics-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NzDrawerModule,
    NzTableModule,
    NzTagModule,
    NzEmptyModule,
    NzSpinModule,
    MatDialogModule
  ],
  templateUrl: './sales-analytics-card.component.html',
  styleUrls: ['./sales-analytics-card.component.scss']
})
export class SalesAnalyticsCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() revenueDataList: { year: number, data: any }[] = [];
  @Output() yearChange = new EventEmitter<number>();
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;

  Math = Math;
  selectedYear = 2025;
  barChart!: Chart;

  // Side Panel State
  isPanelOpen = false;
  selectedDate = '';
  selectedDayInvoices: any[] = [];
  isLoadingInvoices = false;

  private dashboardService = inject(DashboardService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  // Grouped by year and then month
  processedHeatmaps: {
    year: number,
    months: { name: string, days: any[] }[]
  }[] = [];

  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Consistent color mapping with parent
  yearColors: { [key: number]: string } = {
    2026: '#6366f1',
    2025: '#3b82f6',
    2024: '#10b981',
    2023: '#f59e0b',
    2022: '#ef4444'
  };

  constructor() { }

  ngOnInit() {
    moment.tz.setDefault('Asia/Kolkata');
    if (this.revenueDataList && this.revenueDataList.length > 0) {
      this.processAllHeatmaps();
    }
  }

  ngOnDestroy() {
    if (this.barChart) {
      this.barChart.destroy();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    if (this.revenueDataList && this.revenueDataList.length > 0) {
      this.initBarChart();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['revenueDataList'] && !changes['revenueDataList'].firstChange) {
      this.processAllHeatmaps();
      this.updateBarChart();
    }
  }

  private processAllHeatmaps() {
    this.processedHeatmaps = this.revenueDataList.map(item => ({
      year: item.year,
      months: this.groupDaysByMonth(item.year, item.data.daily || {})
    }));
  }

  private groupDaysByMonth(year: number, daily: any) {
    const startOfYear = moment(`${year}-01-01`);
    const endOfYear = moment(`${year}-12-31`);

    const values = Object.values(daily) as number[];
    const maxVal = values.length > 0 ? Math.max(...values, 1) : 1;

    const monthData: { name: string, days: any[] }[] = [];

    for (let i = 0; i < 12; i++) {
      const monthStart = moment(`${year}-${String(i + 1).padStart(2, '0')}-01`);
      const monthEnd = monthStart.clone().endOf('month');
      const days = [];

      let current = monthStart.clone();
      while (current.isSameOrBefore(monthEnd) && current.isSameOrBefore(endOfYear)) {
        const dateStr = current.format('YYYY-MM-DD');
        const value = daily[dateStr] || 0;

        let level = 0;
        if (value > 0) {
          level = Math.ceil((value / maxVal) * 4);
        }

        days.push({
          date: dateStr,
          value: value,
          level: level
        });
        current.add(1, 'day');
      }

      monthData.push({
        name: this.monthNames[i],
        days: days
      });
    }

    return monthData;
  }

  private initBarChart() {
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const datasets = this.revenueDataList.map((item) => {
      const monthlyData = item.data.monthly || {};
      const color = this.yearColors[item.year] || '#3b82f6';
      return {
        label: `Revenue ${item.year}`,
        data: this.monthNames.map((_, i) => monthlyData[i + 1] || 0),
        backgroundColor: color,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        hoverBackgroundColor: color + 'dd'
      };
    });

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.monthNames,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: datasets.length > 1,
            position: 'top',
            labels: { color: 'rgba(0,0,0,0.8)' }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            cornerRadius: 8,
            padding: 12
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#666' }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              color: '#666',
              callback: (value) => '₹' + (Number(value) / 1000) + 'k'
            }
          }
        }
      }
    });
  }

  private updateBarChart() {
    if (!this.barChart) {
      this.initBarChart();
      return;
    }

    const datasets = this.revenueDataList.map((item) => {
      const monthlyData = item.data.monthly || {};
      const color = this.yearColors[item.year] || '#3b82f6';
      return {
        label: `Revenue ${item.year}`,
        data: this.monthNames.map((_, i) => monthlyData[i + 1] || 0),
        backgroundColor: color,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        hoverBackgroundColor: color + 'dd'
      };
    });

    this.barChart.data.datasets = datasets;
    this.barChart.options.plugins!.legend!.display = datasets.length > 1;
    this.barChart.update();
  }

  getTooltip(day: any): string {
    return `${day.date}: ₹${day.value.toLocaleString()}`;
  }

  onDayClick(day: any) {
    if (day.value === 0) return; // Optional: Only show for days with data

    this.selectedDate = day.date;
    this.isPanelOpen = true;
    this.isLoadingInvoices = true;
    this.selectedDayInvoices = [];

    this.dashboardService.getHeatmapInvoices(day.date)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.selectedDayInvoices = (res.data || []).map((inv: any) => ({
            ...inv,
            invoiceDate: moment.utc(inv.invoiceDate).tz('Asia/Kolkata').toISOString()
          }));
          this.isLoadingInvoices = false;
        },
        error: (err: any) => {
          console.error('Error fetching invoices', err);
          this.isLoadingInvoices = false;
        }
      });
  }

  closePanel() {
    this.isPanelOpen = false;
  }

  openExisitingInvoice(invoice: any) {
    const dialogRef = this.dialog.open(PosComponent, {
      width: '100%',
      maxWidth: '100vw',
      height: '100%',
      panelClass: 'full-screen-dialog',
      disableClose: true,
      data: { existingInvoice: invoice }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        // Refresh current date's invoices if needed
        if (this.selectedDate) {
          this.isLoadingInvoices = true;
          this.dashboardService.getHeatmapInvoices(this.selectedDate)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (res: any) => {
                this.selectedDayInvoices = (res.data || []).map((inv: any) => ({
                  ...inv,
                  invoiceDate: moment.utc(inv.invoiceDate).tz('Asia/Kolkata').toISOString()
                }));
                this.isLoadingInvoices = false;
              },
              error: () => this.isLoadingInvoices = false
            });
        }
      });
  }
}
