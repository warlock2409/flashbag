import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FormsModule } from '@angular/forms';
import { SidePanelComponent } from 'src/app/components/shared/side-panel/side-panel.component';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-rental-details',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule, NzAvatarModule, NzRateModule, FormsModule,
    SidePanelComponent,
    DecimalPipe, NzSegmentedModule
  ],
  templateUrl: './rental-details.component.html',
  styleUrl: './rental-details.component.scss'
})
export class RentalDetailsComponent {
  isPanelOpen: boolean = false;
  options = ['Trend', 'Details'];
  activeSegment: string | number = 'Trend'
  chart: Chart | null = null;

  constructor() {
    // Register Chart.js modules to avoid tree-shaking issues
    Chart.register(...registerables);
  }

  ngAfterViewInit(): void {
    this.createChart();
  }


  handleValueChange(e: string | number): void {
    console.log(e);
    this.activeSegment = e;
    if (e === 'Trend') {
      setTimeout(() => this.createChart(), 0); // Wait for the DOM to render
    } else if (this.chart) {
      this.destroyChart();
    }
  }

  closePanel(): void {
    this.isPanelOpen = false;
  }

  openPanel() {
    this.isPanelOpen = true;
  }

  createChart(): void {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    if (ctx && !this.chart) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
            {
              label: 'Bookings',
              data: [65, 59, 80, 81, 56, 55, 40],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
          },
        },
      });
    }
  }

  destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }
}
