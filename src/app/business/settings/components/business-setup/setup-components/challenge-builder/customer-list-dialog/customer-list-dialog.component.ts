import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';

@Component({
  selector: 'app-customer-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './customer-list-dialog.component.html',
  styleUrl: './customer-list-dialog.component.scss'
})
export class CustomerListDialogComponent implements OnInit {
  customers: any[] = [];
  isLoading = false;
  searchQuery = '';
  statusFilter = 'ALL';
  page = 0;
  size = 10;
  isLastPage = true;

  private searchSubject = new Subject<string>();

  statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'REWARDED', label: 'Rewarded' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { challengeId: number; challengeName: string; targetValue: number },
    private dialogRef: MatDialogRef<CustomerListDialogComponent>,
    private orgService: OrganizationServiceService
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400)).subscribe(term => {
      this.searchQuery = term;
      this.refreshList();
    });
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.orgService.getChallengeCustomers(
      this.data.challengeId,
      this.page,
      this.size,
      this.searchQuery,
      this.statusFilter === 'ALL' ? undefined : this.statusFilter
    ).subscribe({
      next: (res: any) => {
        if (res.data?.content) {
          if (this.page === 0) {
            this.customers = res.data.content;
          } else {
            this.customers = [...this.customers, ...res.data.content];
          }
          this.isLastPage = res.data.last;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching challenge customers:', err);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  onFilterChange(): void {
    this.refreshList();
  }

  refreshList(): void {
    this.page = 0;
    this.customers = [];
    this.loadCustomers();
  }

  loadMore(): void {
    if (!this.isLastPage && !this.isLoading) {
      this.page++;
      this.loadCustomers();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'EXPIRED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PAUSED': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'REWARDED': return 'bg-violet-100 text-violet-700 border-violet-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
