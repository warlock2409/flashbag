import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ShopModel } from 'src/app/models/shop.model';
import { CustomerGeneralComponent } from './customer-general/customer-general.component';
import { CustomersActionsComponent } from './customers-actions/customers-actions.component';
import { DocumentDto, UploadMediaComponent } from 'src/app/components/upload-media/upload-media.component';
import { AddCustomerComponent } from '../components/add-customer/add-customer.component';
import { CustomerMembershipComponent } from './customer-membership/customer-membership.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';

@Component({
  selector: 'app-customer-configure-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [MatDialog],
  template: `
    <div class="configure-content">
      <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <h4 class="!text-xl !font-bold !m-0 text-gray-800">{{customer?.firstName}} {{customer?.lastName}}</h4>
        <div class="flex items-center gap-2">
          <button mat-stroked-button (click)="openCustomerInfo()" class="!text-blue-400 !border-blue-100 hover:!bg-blue-50 !px-3">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="!mr-1">edit</mat-icon>
            <span class="text-sm font-semibold">Edit</span>
          </button>
          <button mat-stroked-button (click)="deleteCustomer()" class="!text-red-400 !border-red-100 hover:!bg-red-50 !px-3">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="!mr-1">delete</mat-icon>
            <span class="text-sm font-semibold">Delete</span>
          </button>
        </div>
      </div>

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

        <div 
          class="config-card p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          (click)="openMembership()"
          >
          <div class="flex items-center">
            <div class="bg-yellow-100 p-2 rounded-lg mr-3 flex items-center justify-center">
              <span class="text-pink-600 text-xl">📅</span>
            </div>
            <div class="flex-1">
              <h5 class="!font-semibold text-lg text-gray-900 !mb-1">Membership</h5>
              <p class="text-sm text-gray-600 !mb-2">View and manage customer membership details</p>
            </div>
          </div>
        </div>

        <div 
          class="config-card p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          (click)="openMonthlyReport()"
          >
          <div class="flex items-center">
            <div class="bg-blue-100 p-2 rounded-lg mr-3 flex items-center justify-center">
              <span class="text-pink-600 text-xl">📊</span>
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
        padding: 0.5rem 1rem;
        // margin-left: 60px;
        // margin-right: 20px;
      }
    }
    
    /* Desktop styles */
    @media (min-width: 1024px) {
      .configure-content {
        padding: 0.2rem 1rem;
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
  @Output() customerDeleted = new EventEmitter<void>();
  sampleUploads: DocumentDto | null = null;

  constructor(
    private dialog: MatDialog,
    private orgService: OrganizationServiceService,
    private swalService: SweatAlertService
  ) {
  }

  ngOnInit(): void {
    console.log(this.customer);
  }

  openCustomerInfo() {
    this.dialog.open(AddCustomerComponent, {
      width: '500px',
      maxHeight: '90vh',
      data: { customer: this.customer, mode: 'edit' }
    });
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

  deleteCustomer() {
    this.swalService.confirm(
      `Are you sure you want to delete ${this.customer?.firstName}? This action cannot be undone.`,
      'Delete Customer',
      'Delete',
      'Cancel'
    ).then((result) => {
      if (result.isConfirmed) {
        this.orgService.deleteCustomer(this.customer.id).subscribe({
          next: () => {
            this.swalService.success('Customer deleted successfully');
            this.customerDeleted.emit();
          },
          error: (err) => {
            this.swalService.error('Failed to delete customer');
            console.error(err);
          }
        });
      }
    });
  }

  openMembership() {
    this.dialog.open(CustomerMembershipComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { customer: this.customer }
    });
  }
}