import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartDataset, ChartOptions, ChartType, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-attendance-chart',
  imports: [FormsModule,CommonModule],
  templateUrl: './attendance-chart.component.html',
  styleUrl: './attendance-chart.component.scss'
})
export class AttendanceChartComponent {
  @Input() attendanceData: { hour: number; todayMembers: number; meanMembers: number }[] = [];

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart<'bar'>;

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['attendanceData'] && this.chart) {
      this.updateChart();
    }
  }

  private createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar', // base chart type
      data: this.getChartData(),
      options: this.getChartOptions(),
    });
  }

  private updateChart() {
    this.chart.data = this.getChartData();
    this.chart.update();
  }

  private getChartData() {
    const labels = this.attendanceData.map(d => d.hour.toString());
    const todayMembers = this.attendanceData.map(d => d.todayMembers);
    const meanMembers = this.attendanceData.map(d => d.meanMembers);

    const datasets: ChartDataset<'bar', number[]>[] = [
      {
        label: 'Today Check-In',
        data: todayMembers,
        backgroundColor: 'rgba(5, 233, 114, 1)',
        borderWidth: 1,
        borderRadius: 0,
      },
      {
        label: 'Average Check-In',
        data: meanMembers,
        backgroundColor: 'rgba(81, 162, 255, 1)',
        borderWidth: 1,
        borderRadius: 1,
      },
    ];

    return { labels, datasets };
  }

  private getChartOptions(): ChartOptions<'bar'> {
    return {
      responsive: true,
      plugins: {
        legend: {display:false },
        title: { display: false,},
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: false, text: 'Hour of Day' },
          stacked: false, // side-by-side bars
        },
        y: {
          title: { display: false, text: 'Members Count' },
          beginAtZero: true,
          stacked: false,
        },
      },
    };
  }
}
