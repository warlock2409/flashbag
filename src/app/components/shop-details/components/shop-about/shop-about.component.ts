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
    <div class="py-10 border-t border-slate-800">
      <h2 class="text-xl font-bold !text-white mb-6">About</h2>
      <p class="!text-slate-400 leading-relaxed mb-10 whitespace-pre-line">{{about}}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h3 class="text-lg font-semibold !text-slate-200 mb-5">Opening Times</h3>
          <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-xl">
            <table class="w-full text-sm">
              <tbody class="divide-y divide-slate-700">
                <tr *ngFor="let time of openingTimes" class="hover:bg-slate-700/30 transition-colors">
                  <td class="py-3 font-medium text-slate-300 capitalize">{{time.day.toLowerCase()}}</td>
                  <td class="py-3 text-right" [ngClass]="time.hours === 'Holiday' ? 'text-red-400 font-medium' : 'text-slate-400'">
                    {{time.hours}}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold !text-slate-200 mb-5">Location</h3>
          <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-xl">
            <p class="text-sm text-slate-400 mb-6 flex items-start gap-3">
              <span class="text-blue-400 mt-0.5">📍</span>
              <span class="leading-relaxed">{{location}}</span>
            </p>
            <div 
              (click)="openMap()"
              class="h-48 bg-slate-900/50 rounded-xl flex flex-col items-center justify-center text-slate-500 text-sm font-medium border border-dashed border-slate-700 cursor-pointer hover:bg-slate-900/80 transition-all group">
              <span class="text-3xl mb-2 group-hover:scale-110 transition-transform">🗺️</span>
              <span>Click to view on Google Maps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ShopAboutComponent {
  @Input() about: string = '';
  @Input() openingTimes: OpeningTime[] = [];
  @Input() location: string = '';
  @Input() latitude?: number;
  @Input() longitude?: number;

  openMap() {
    if (this.latitude && this.longitude) {
      const url = `https://www.google.com/maps?q=${this.longitude},${this.latitude}`;
      window.open(url, '_blank');
    }
  }
}