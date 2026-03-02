import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ShopModel } from 'src/app/models/shop.model';
import { CustomerGeneralComponent } from './customer-general/customer-general.component';
import { CustomersActionsComponent } from './customers-actions/customers-actions.component';
import { DocumentDto, UploadMediaComponent } from 'src/app/components/upload-media/upload-media.component';

@Component({
  selector: 'app-customer-configure-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, UploadMediaComponent
  ],
  providers: [MatDialog],
  template: `
    <div class="configure-content">
      <h4 class="!text-lg !mb-2">Customer Name</h4>

      <!-- <app-upload-media [existingUploads]="sampleUploads" [multiple]="false"
                        [type]="'CUSTOMER'" (uploaded)="setDocument($event)"
                        class="flex-none w-50"></app-upload-media> -->
      
      <div class="configuration-options flex flex-col gap-4">
      <div 
          class="config-card p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          (click)="openGeneralSettings()"
          >
          <div class="flex items-center">
            <div class="bg-blue-100 p-2 rounded-lg mr-3 flex items-center justify-center">
              <span class="text-pink-600 text-xl">⚙️</span>
            </div>
            <div class="flex-1">
              <h5 class="!font-semibold text-lg text-gray-900 !mb-1">General</h5>
              <p class="text-sm text-gray-600 !mb-2">Manage general settings for your customer</p>
            </div>
          </div>
        </div>

        <!-- <div 
          class="config-card p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
          <div class="flex items-center">
            <div class="bg-blue-100 p-2 rounded-lg mr-3 flex items-center justify-center">
              <span class="text-blue-600 text-xl">🕒</span>
            </div>
            <div class="flex-1">
              <h5 class="!font-semibold text-lg text-gray-900 !mb-1">Customer activity</h5>
              <p class="text-sm text-gray-600 !mb-2">View and manage customer activity</p>
            </div>
          </div>
        </div> -->

        <div 
          class="config-card p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          (click)="openMonthlyReport()"
          >
          <div class="flex items-center">
            <div class="bg-yellow-100 p-2 rounded-lg mr-3 flex items-center justify-center">
              <span class="text-pink-600 text-xl">📅</span>
            </div>
            <div class="flex-1">
              <h5 class="!font-semibold text-lg text-gray-900 !mb-1">Monthly Report</h5>
              <p class="text-sm text-gray-600 !mb-2">View monthly reports and share them with customers</p>
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
    
    /* Mobile styles */
    .configure-content {
      padding: 1rem;
    }
    
    /* Tablet styles - add margin to account for sidebar */
    @media (min-width: 768px) and (max-width: 1023px) {
      .configure-content {
        padding: 1rem;
        margin-left: 60px;
        margin-right: 20px;
      }
    }
    
    /* Desktop styles */
    @media (min-width: 1024px) {
      .configure-content {
        padding: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
      }
    }
  `]
})
export class CustomerConfigurePanelComponent {
  setDocument($event: DocumentDto) {
    throw new Error('Method not implemented.');
  }
  @Input() customer: any;
  sampleUploads: DocumentDto | null = null;

  constructor(private dialog: MatDialog) {
    console.log('CustomerConfigurePanelComponent initialized', this.customer);
  }

  openGeneralSettings() {
    this.dialog.open(CustomerGeneralComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { customer: this.customer }
    });
  }

  openMonthlyReport() {
    this.dialog.open(CustomersActionsComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { customer: this.customer }
    });
  }
}