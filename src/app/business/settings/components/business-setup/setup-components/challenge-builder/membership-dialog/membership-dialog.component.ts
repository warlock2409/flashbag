import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';

@Component({
  selector: 'app-membership-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './membership-dialog.component.html'
})
export class MembershipDialogComponent implements OnInit {
  memberships: any[] = [];
  filteredMemberships: any[] = [];
  searchTerm: string = '';
  selectedMembership: any = null;
  isLoading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<MembershipDialogComponent>,
    private orgService: OrganizationServiceService
  ) {}

  ngOnInit() {
    this.getMemberships();
  }

  getMemberships() {
    this.isLoading = true;
    this.orgService.getAllOrgMembership().subscribe({
      next: (res: any) => {
        const data = res.data || (Array.isArray(res) ? res : []);
        this.memberships = data;
        this.filteredMemberships = [...this.memberships];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching org memberships', err);
        this.isLoading = false;
      }
    });
  }

  filterMemberships() {
    const term = this.searchTerm.toLowerCase();
    this.filteredMemberships = this.memberships.filter(m => 
      m.name?.toLowerCase().includes(term) || 
      m.description?.toLowerCase().includes(term)
    );
  }

  selectMembership(membership: any) {
    this.selectedMembership = membership;
  }

  close() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close(this.selectedMembership);
  }
}
