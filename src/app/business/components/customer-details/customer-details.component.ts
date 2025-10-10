import { Component, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DocumentDto, UploadMediaComponent } from "src/app/components/upload-media/upload-media.component";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButton } from "@angular/material/button";
import { CommonModule } from '@angular/common';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
interface RecordItem {
  name?: string;
  number?: string;
  title?: string;
  status: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  startedAt?: string;
}

interface RecordGroup {
  type: string;
  items: RecordItem[];
}

@Component({
  selector: 'app-customer-details',
  imports: [MatChipsModule,
    MatIconModule,
    MatInputModule,
    FormsModule,NzPaginationModule,
    CommonModule,
    ReactiveFormsModule, UploadMediaComponent, MatExpansionModule, MatButton],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent {
   current = 1;
  deleteRecord(_t134:any, arg1: string) {
    throw new Error('Method not implemented.');
  }
  editRecord(_t134: any) {
    throw new Error('Method not implemented.');
  }
  addRecord(arg0: string) {
    throw new Error('Method not implemented.');
  }
  readonly panelOpenState = signal(false);
  placeHolderUrl: string = "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3hudmNob3QwMjU2NGdidmJ2ZzllNDJhY254NnF5MmJjbG90dDNtMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NRsdYztamSfJzS3jLj/giphy.gif";
  setDocument($event: DocumentDto) {
    throw new Error('Method not implemented.');
  }
  sampleUploads: DocumentDto | null = null;



  categories = ['All', 'Memberships', 'Invoices', 'Orders', 'Services', 'Rentals'];
  selectedFilter = 'All';

  onFilterChange(value: string) {
    this.selectedFilter = value;
  }

  getIcon(category: string): string {
    switch (category) {
      case 'All': return 'fa-solid fa-star-of-life';
      case 'Memberships': return 'fa-solid fa-id-card';
      case 'Invoices': return 'fa-solid fa-file-invoice';
      case 'Orders': return 'fa-solid fa-bag-shopping';
      case 'Services': return 'fa-solid fa-calendar-check';
      case 'Rentals': return 'fa-solid fa-key';
      default: return 'fa-solid fa-circle-info';
    }
  }

  filteredRecords:RecordGroup[] = [
    {
      type: 'Memberships',
      items: [
        {
          name: 'Gold Plan',
          status: 'Active',
          startDate: '2025-01-15',
          endDate: '2026-01-14'
        },
        {
          name: 'Yoga Add-on',
          status: 'Paused',
          startDate: '2024-09-01',
          endDate: '2025-08-31'
        }
      ]
    },
    {
      type: 'Invoices',
      items: [
        {
          number: '#INV-1023',
          status: 'Paid',
          date: '2025-09-12'
        },
        {
          number: '#INV-1024',
          status: 'Pending',
          date: '2025-09-28'
        }
      ]
    },
    {
      type: 'Orders',
      items: [
        {
          title: 'Hair Spa Package',
          status: 'Completed',
          date: '2025-09-20'
        },
        {
          title: 'Nail Care',
          status: 'Scheduled',
          date: '2025-10-10'
        }
      ]
    },
    {
      type: 'Services',
      items: [
        {
          title: 'Haircut with Stylist A',
          status: 'Completed',
          startedAt: '2025-09-25'
        },
        {
          title: 'Facial Treatment',
          status: 'Upcoming',
          startedAt: '2025-10-15'
        }
      ]
    },
    {
      type: 'Rentals',
      items: [
        {
          title: 'Hair Dryer Rental',
          status: 'Returned',
          date: '2025-08-30'
        },
        {
          title: 'Massage Chair Rental',
          status: 'Active',
          date: '2025-10-05'
        }
      ]
    }
  ];



}
