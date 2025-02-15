import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OpeningTime {
  day: string;
  hours: string;
}

@Component({
  selector: 'app-shop-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-section">
      <h2>About</h2>
      <p class="about-text">{{about}}</p>

      <div class="opening-times">
        <h3>Opening Times</h3>
        <div class="time-grid">
          <div *ngFor="let time of openingTimes" class="time-row">
            <span class="day">{{time.day}}</span>
            <span class="hours">{{time.hours}}</span>
          </div>
        </div>
      </div>

      <div class="location-info">
        <h3>Location</h3>
        <p>{{location}}</p>
        <div class="map">
          <!-- Map integration can be added here -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-section {
      padding: 24px 0;

      .about-text {
        margin-bottom: 32px;
        line-height: 1.6;
      }

      .opening-times {
        margin-bottom: 32px;

        .time-grid {
          display: grid;
          gap: 8px;

          .time-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;

            .day {
              font-weight: 500;
            }
          }
        }
      }

      .location-info {
        .map {
          height: 200px;
          background: #f8f8f8;
          margin-top: 16px;
          border-radius: 8px;
        }
      }
    }
  `]
})
export class ShopAboutComponent {
  @Input() about: string = '';
  @Input() openingTimes: OpeningTime[] = [];
  @Input() location: string = '';
} 