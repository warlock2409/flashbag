import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ShopModel } from 'src/app/models/shop.model';

@Component({
    selector: 'app-configure-panel',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule
    ],
    template: `
    <div class="configure-content p-4">
      <h4 class="!text-lg !mb-2">{{ shop?.name }}</h4>
      <p class="text-gray-600 !mb-4">Location: {{ shop?.address }}</p>
      
      <div class="configuration-options flex flex-col gap-4">
      <div 
          class="config-card p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          (click)="onOptionSelect('general')">
          <div class="flex items-center">
            <div class="bg-gray-100 p-2 rounded-lg mr-3 flex items-center justify-center">
              <span class="text-pink-600 text-xl">⚙️</span>
            </div>
            <div class="flex-1">
              <h5 class="!font-semibold text-lg text-gray-900 !mb-1">General</h5>
              <p class="text-sm text-gray-600 !mb-2">Manage general settings for your shop</p>
            </div>
          </div>
        </div>
        <div 
          class="config-card p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          (click)="onOptionSelect('business-hours')">
          <div class="flex items-center">
            <div class="bg-blue-100 p-2 rounded-lg mr-3 flex items-center justify-center">
              <span class="text-blue-600 text-xl">🕒</span>
            </div>
            <div class="flex-1">
              <h5 class="!font-semibold text-lg text-gray-900 !mb-1">Business Hours</h5>
              <p class="text-sm text-gray-600 !mb-2">Manage opening and closing times</p>
            </div>
          </div>
        </div>

        <div 
          class="config-card p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          (click)="onOptionSelect('address')">
          <div class="flex items-center">
            <div class="bg-green-100 p-2 rounded-lg mr-3 flex items-center justify-center">
              <span class="text-green-600 text-xl">📍</span>
            </div>
            <div class="flex-1">
              <h5 class="!font-semibold text-lg text-gray-900 !mb-1">Address</h5>
              <p class="text-sm text-gray-600 !mb-2">Manage address, including street, city, state, and zip code</p>
            </div>
          </div>
        </div>

        <div 
          class="config-card p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          (click)="onOptionSelect('holidays')">
          <div class="flex items-center">
            <div class="bg-yellow-100 p-2 rounded-lg mr-3 flex items-center justify-center">
              <span class="text-pink-600 text-xl">📅</span>
            </div>
            <div class="flex-1">
              <h5 class="!font-semibold text-lg text-gray-900 !mb-1">Holidays</h5>
              <p class="text-sm text-gray-600 !mb-2">Manage holidays and special schedules</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .config-card {
      transition: all 0.2s ease;
    }
    
    .config-card:hover {
      transform: translateY(-2px);
    }
  `]
})
export class ConfigurePanelComponent {
    @Input() shop: ShopModel | null = null;
    @Output() optionSelected = new EventEmitter<string>();

    onOptionSelect(option: string) {
        this.optionSelected.emit(option);
    }
}