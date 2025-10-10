import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartData, ChartDataset, ChartOptions, ChartType, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-attendance-chart',
  imports: [FormsModule, CommonModule],
  templateUrl: './attendance-chart.component.html',
  styleUrl: './attendance-chart.component.scss'
})
export class AttendanceChartComponent {
  @Input() attendanceData: { hour: number; todayMembers: number; meanMembers: number }[] = [];

  // @ViewChild('chartCanvas') chartRef!: ElementRef<HTMLCanvasElement>;
  // chart!: Chart;

  constructor() {
    // Chart.register(...registerables); // Register Chart.js components
    console.log(this.attendanceData, "*attendance-chart");



  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['attendanceData'] && !changes['attendanceData'].firstChange) {
      this.updateChart();
    }
  }

  @ViewChild('chartCanvas') chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  updateChart() {
    if (!this.chart) return;

    // Filter out early hours if needed (e.g., 0-4 AM)
    const filteredData = this.attendanceData;
    console.log(this.attendanceData);

    // Update labels
    this.chart.data.labels = filteredData.map(d => {
    const hour = d.hour;
    if (hour === 0) return '12AM';
    if (hour < 12) return `${hour}AM`;
    if (hour === 12) return '12PM';
    return `${hour - 12}PM`;
  });

    // Update datasets
    this.chart.data.datasets[0].data = filteredData.map(d => d.todayMembers);
    this.chart.data.datasets[1].data = filteredData.map(d => d.meanMembers);

    // Trigger chart update
    this.chart.update();
  }

  ngAfterViewInit(): void {
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Create gradients
    const primaryGradient = ctx.createLinearGradient(0, 0, 0, 300);
    primaryGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    primaryGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    const secondaryGradient = ctx.createLinearGradient(0, 0, 0, 300);
    secondaryGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    secondaryGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    console.log(this.attendanceData);
    
    const data = {
      labels: this.attendanceData.map(d => {
        const hour = d.hour;
        if (hour === 0) return '12AM';
        if (hour < 12) return `${hour}AM`;
        if (hour === 12) return '12PM';
        return `${hour - 12}PM`;
      }),

      datasets: [
        {
          label: 'Today',
          data: this.attendanceData.map(d => d.todayMembers),
          borderColor: '#3B82F6',
          backgroundColor: primaryGradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: '#3B82F6',
          pointHoverBackgroundColor: '#ffffff',
        },
        {
          label: 'Yesterday',
          data: this.attendanceData.map(d => d.meanMembers),
          borderColor: 'rgba(255, 255, 255, 0.3)',
          backgroundColor: secondaryGradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderDash: [5, 5],
        }
      ] as ChartDataset<'line'>[]
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: false,
          callbacks: {
            title: () => '', // no title
            label: (context) => `${context.parsed.y} members`
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
            font: { size: 10 }
          }
        },
        y: {
          display: false,
          grid: { display: false }
        }
      },
      elements: { line: { borderCapStyle: 'round', borderJoinStyle: 'round' } }
    };

    this.chart = new Chart(ctx, {
      type: 'line',
      data,
      options
    });
  }


}
