import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomerListDialogComponent } from './customer-list-dialog/customer-list-dialog.component';
import { ChallengeDetailsDialogComponent } from './challenge-details-dialog/challenge-details-dialog.component';

@Component({
  selector: 'app-challenge-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './challenge-list.component.html',
  styleUrl: './challenge-list.component.scss'
})
export class ChallengeListComponent implements OnInit, OnDestroy {
  challenges: any[] = [];
  displayedColumns: string[] = ['name', 'condition', 'reward', 'progress', 'status', 'actions'];

  searchQuery: string = '';
  activeFilter: string = 'ALL'; // ALL, ACTIVE, DRAFT, EXPIRED
  
  page: number = 0;
  size: number = 10;
  isLastPage: boolean = true;
  isLoading: boolean = false;
  
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router, 
    private orgService: OrganizationServiceService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400)).subscribe(term => {
      this.searchQuery = term;
      this.page = 0;
      this.challenges = [];
      this.loadChallenges();
    });
    this.loadChallenges();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  loadChallenges() {
    this.isLoading = true;
    this.orgService.getChallengesByShop(this.page, this.size, this.searchQuery, this.activeFilter).subscribe({
      next: (res: any) => {
        if (res.data?.content) {
          if (this.page === 0) {
            this.challenges = res.data.content;
          } else {
            this.challenges = [...this.challenges, ...res.data.content];
          }
          this.isLastPage = res.data.last;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching challenges:', err);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(event: any) {
    this.searchSubject.next(event.target.value);
  }
  
  onFilterChange(status: string) {
    this.activeFilter = status;
    this.page = 0;
    this.challenges = [];
    this.loadChallenges();
  }

  optOutChallenge(challenge: any, isOptIn: boolean) {
    const actionText = isOptIn ? 'opt in to' : 'opt out of';
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${actionText} the "${challenge.name}" challenge?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5', // Indigo
      cancelButtonColor: '#9ca3af', // Gray
      confirmButtonText: 'Yes, proceed'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.orgService.toggleChallengeShopStatus(challenge.id, isOptIn).subscribe({
          next: (res: any) => {
            Swal.fire('Success!', `Successfully ${isOptIn ? 'opted in' : 'opted out'}.`, 'success');
            this.page = 0;
            this.challenges = [];
            this.loadChallenges();
          },
          error: (err: any) => {
            console.error(`Error ${isOptIn ? 'opting in' : 'opting out'}`, err);
            Swal.fire('Error!', `Could not ${actionText} the challenge.`, 'error');
            this.isLoading = false;
          }
        });
      }
    });
  }

  deleteChallenge(challenge: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to permanently delete the "${challenge.name}" challenge? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Red
      cancelButtonColor: '#9ca3af', // Gray
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.orgService.deleteChallenge(challenge.id).subscribe({
          next: (res: any) => {
            Swal.fire('Deleted!', 'Challenge deleted successfully.', 'success');
            this.page = 0;
            this.challenges = [];
            this.loadChallenges();
          },
          error: (err: any) => {
            console.error('Error deleting challenge', err);
            Swal.fire('Error!', 'Could not delete the challenge.', 'error');
            this.isLoading = false;
          }
        });
      }
    });
  }

  viewParticipants(challenge: any) {
    this.dialog.open(CustomerListDialogComponent, {
      data: {
        challengeId: challenge.id,
        challengeName: challenge.name,
        targetValue: challenge.targetValue
      },
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container'
    });
  }

  viewChallengeDetails(challenge: any) {
    this.isLoading = true;
    this.orgService.getChallengeById(challenge.id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.data) {
          this.dialog.open(ChallengeDetailsDialogComponent, {
            data: {
              challenge: res.data
            },
            width: '550px',
            maxWidth: '95vw',
            panelClass: 'custom-dialog-container'
          });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching challenge details:', err);
        Swal.fire('Error', 'Could not fetch challenge details.', 'error');
      }
    });
  }

  onCreateNew(): void {
    this.router.navigate(['/business/challenge/create']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'EXPIRED': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  calculateProgress(completions: number, total: number): number {
    if (!total || total === 0) return 0;
    return (completions / total) * 100;
  }

  loadMore() {
    if (!this.isLastPage && !this.isLoading) {
      this.page++;
      this.loadChallenges();
    }
  }
}
