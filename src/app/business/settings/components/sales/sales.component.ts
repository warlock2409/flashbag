import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { DashboardService } from 'src/app/services/dashboard.service';
import { SalesAnalyticsCardComponent } from 'src/app/business/components/charts/sales-analytics-card/sales-analytics-card.component';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NzCardModule,
    NzGridModule,
    NzTypographyModule,
    MatButtonModule,
    SalesAnalyticsCardComponent
  ],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  revenueDataList: { year: number, data: any }[] = [];
  selectedYears: number[] = [2025]; // Default year
  availableYears = [2022, 2023, 2024, 2025, 2026];
  yearColors: { [key: number]: string } = {
    2026: '#6366f1', // Indigo
    2025: '#3b82f6', // Blue
    2024: '#10b981', // green
    2023: '#f59e0b', // orange
    2022: '#ef4444'  // red
  };
  salesOptions = [
    {
      title: 'Payment methods',
      desc: 'Manage how your clients pay for services and products.',
      icon: 'payments',
      status: 'Available',
      color: '#4CAF50'
    },
    {
      title: 'Taxes',
      desc: 'Set up tax rates and tax rules for your business.',
      icon: 'receipt_long',
      status: 'Configured',
      color: '#2281cfff'
    },
    {
      title: 'Receipts',
      desc: 'Customise your receipt templates and information.',
      icon: 'description',
      status: 'Ready',
      color: '#FF9800'
    },
    {
      title: 'Service charges',
      desc: 'Configure additional fees for services.',
      icon: 'add_business',
      status: 'Optional',
      color: '#9C27B0'
    },
    {
      title: 'Gift cards',
      desc: 'Create and manage digital and physical gift cards.',
      icon: 'card_giftcard',
      status: 'Coming Soon',
      color: '#F44336'
    }
  ];

  constructor(private router: Router, private dashboardService: DashboardService) { }

  ngOnInit() {
    this.fetchRevenueData();
  }

  onYearToggle(year: number) {
    const index = this.selectedYears.indexOf(year);
    if (index > -1 && this.selectedYears.length > 1) {
      this.selectedYears.splice(index, 1);
    } else if (index === -1) {
      this.selectedYears.push(year);
      this.selectedYears.sort();
    }
    this.fetchRevenueData();
  }

  fetchRevenueData() {
    import('rxjs').then(({ forkJoin }) => {
      const requests = this.selectedYears.map(year =>
        this.dashboardService.getRevenueHeatmap(year)
      );

      forkJoin(requests).subscribe({
        next: (results: any[]) => {
          this.revenueDataList = results.map((res, i) => ({
            year: this.selectedYears[i],
            data: res.data
          }));
        },
        error: (err: any) => {
          console.error('Error fetching revenue data', err);
        }
      });
    });
  }

  getTotalRevenue(monthly: any): number {
    if (!monthly) return 0;
    return Object.values(monthly).reduce((acc: any, val: any) => acc + (Number(val) || 0), 0) as number;
  }

  goBack() {
    this.router.navigate(['/business/settings']);
  }
}
