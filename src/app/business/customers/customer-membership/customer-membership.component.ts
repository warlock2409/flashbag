import { Component, Inject, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';
import { ShopService } from 'src/app/services/shop.service';
import { ServiceResponse } from 'src/app/app.component';
import { PosActionsComponent } from '../../components/pos/pos-actions/pos-actions.component';

@Component({
  selector: 'app-customer-membership',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule, MatButtonModule],
  templateUrl: './customer-membership.component.html',
  styleUrl: './customer-membership.component.scss'
})
export class CustomerMembershipComponent {
  orgService = inject(OrganizationServiceService);
  swallService = inject(SweatAlertService);
  shopService = inject(ShopService);
  dialog = inject(MatDialog);

  customer: any;
  cancelling = false;
  membershipHistory: any[] = [];
  upcomingMembership: any = null;
  currentMembership: any = null;

  constructor(
    public dialogRef: MatDialogRef<CustomerMembershipComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.customer = data?.customer;
    this.loadMembershipData();
  }

  loadMembershipData() {
    if (!this.customer?.id) return;

    this.shopService.getCustomerMembershipDetails(this.customer.id).subscribe({
      next: (res: ServiceResponse<any[]>) => {
        if (res.data) {
          const now = new Date();

          // Categorize memberships
          const active = res.data.filter((m: any) => m.status === 'ACTIVE');
          const pending = res.data.filter((m: any) => m.status === 'PENDING');
          const others = res.data.filter((m: any) => m.status !== 'ACTIVE' && m.status !== 'PENDING');

          // Current: Active and already started
          const currentMemberships = active.filter((m: any) => new Date(m.startDate) <= now);
          if (currentMemberships.length > 0) {
            // Pick the one that expires furthest in the future as current
            this.currentMembership = currentMemberships.reduce((prev: any, curr: any) =>
              new Date(prev.endDate) > new Date(curr.endDate) ? prev : curr
            );
            this.customer.membershipName = this.currentMembership.planName;
            this.customer.membershipExpiry = this.currentMembership.endDate;
          } else {
            this.currentMembership = null;
            this.customer.membershipName = null;
            this.customer.membershipExpiry = null;
          }

          // Upcoming: Active and starts in the future OR PENDING
          this.upcomingMembership = active.find((m: any) => new Date(m.startDate) > now) || pending[0];
          if (this.upcomingMembership) {
            this.upcomingMembership = {
              ...this.upcomingMembership,
              // Ensure we have a consistent object structure
              startDate: new Date(this.upcomingMembership.startDate),
              endDate: new Date(this.upcomingMembership.endDate)
            };
          }

          // History: Others + expired ones
          const expiredActive = active.filter((m: any) => new Date(m.endDate) < now);
          this.membershipHistory = [...others, ...expiredActive].map((m: any) => ({
            id: m.id,
            planName: m.planName,
            startDate: new Date(m.startDate),
            expiryDate: new Date(m.endDate),
            status: m.status === 'ACTIVE' ? 'Expired' : m.status,
            amount: m.amount || 0
          }));
        }
      },
      error: (err) => {
        console.error('Error loading membership data:', err);
        this.swallService.error('Failed to load membership data.');
      }
    });
  }

  get isMembershipExpired(): boolean {
    if (!this.customer?.membershipExpiry) return true;
    return new Date(this.customer.membershipExpiry).getTime() < new Date().getTime();
  }

  get remainingDays(): number {
    if (!this.customer?.membershipExpiry) return 0;
    const expiry = new Date(this.customer.membershipExpiry).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  get membershipStatusLabel(): string {
    if (!this.customer?.membershipName && !this.customer?.membershipExpiry) return 'No Membership';
    return this.isMembershipExpired ? 'Expired' : 'Active';
  }

  /** Progress bar width (0-100) used in template to avoid Math.min in template expressions */
  get progressWidth(): number {
    return this.isMembershipExpired ? 0 : Math.min((this.remainingDays / 365) * 100, 100);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  cancelMembership(type: 'current' | 'upcoming' | 'history' = 'current', membership?: any): void {
    const targetName = type === 'current' ? this.customer.firstName : (membership?.planName || 'this membership');

    this.swallService.confirm(
      `Are you sure you want to cancel the ${type} membership (${targetName})? This action cannot be undone.`,
      'Cancel Membership',
      'Yes, Cancel',
      'Keep Active'
    ).then((result: any) => {
      if (result?.isConfirmed) {
        let membershipIdToCancel: number | undefined;

        if (type === 'current' && this.currentMembership) {
          membershipIdToCancel = this.currentMembership.id;
        } else if (type === 'upcoming' && this.upcomingMembership) {
          membershipIdToCancel = this.upcomingMembership.id;
        } else if (type === 'history' && membership) {
          membershipIdToCancel = membership.id;
        }

        if (membershipIdToCancel) {
          this.cancelling = true;
          this.shopService.updateCustomerMembershipStatus(this.customer.id, membershipIdToCancel, 'CANCELLED').subscribe({
            next: () => {
              this.cancelling = false;
              this.swallService.success('Membership cancelled successfully.');
              this.dialogRef.close();
            },
            error: (err) => {
              this.cancelling = false;
              console.error('Error cancelling membership:', err);
              this.swallService.error('Failed to cancel membership. Please try again.');
            }
          });
        } else {
          this.swallService.error('No membership found to cancel.');
        }
      }
    });
  }

  activateUpcomingMembership(): void {
    if (!this.upcomingMembership) return;

    const dialogRef = this.dialog.open(PosActionsComponent, {
      disableClose: true,
      data: { type: "MEMBERSHIP_START_DATE_PICKER", name: "Select Activation Start Date", minDate: new Date() }
    });

    dialogRef.afterClosed().subscribe((selectedDate: Date) => {
      if (selectedDate) {
        this.cancelling = true;
        const request = {
          status: 'ACTIVE',
          startDate: selectedDate
        };

        this.shopService.updatePendingMembershipStatus(this.customer.id, this.upcomingMembership.id, request).subscribe({
          next: () => {
            this.cancelling = false;
            this.swallService.success('Membership activated successfully.');
            this.dialogRef.close();
          },
          error: (err) => {
            this.cancelling = false;
            console.error('Error activating membership:', err);
            this.swallService.error('Failed to activate membership.');
          }
        });
      }
    });
  }
}
