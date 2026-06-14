import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ShopService } from '../../../../services/shop.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TrialDatePickerDialogComponent } from '../../../shared/trial-date-picker-dialog/trial-date-picker-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shop-membership',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './shop-membership.component.html',
  styleUrl: './shop-membership.component.scss'
})
export class ShopMembershipComponent {
  private shopService = inject(ShopService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  @Input() memberships: any[] = [];
  @Input() shopCode: string | null = null;
  @Input() shopName: string | null = null;
  @Input() hasTrialBooking: boolean = false;
  @Input() upcomingEvents: any[] = [];
  @Input() activeMembership: any = null;

  onBookTrial(plan: any) {
    console.log(plan);

    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in to book a trial.',
        icon: 'info',
        confirmButtonText: 'Login',
        confirmButtonColor: '#7c3aed',
        showCancelButton: true,
        background: '#1e293b',
        color: '#f1f5f9'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const currentUser = JSON.parse(currentUserStr);
    const firebaseUid = currentUser.firebaseUid;

    if (!firebaseUid) {
      Swal.fire({
        title: 'Error',
        text: 'User unique ID not found. Please log in again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        background: '#1e293b',
        color: '#f1f5f9'
      });
      return;
    }

    const dialogRef = this.dialog.open(TrialDatePickerDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      panelClass: 'trial-date-picker-dialog'
    });

    dialogRef.afterClosed().subscribe(selectedDate => {
      if (selectedDate) {
        Swal.fire({
          title: 'Booking Trial...',
          text: 'Please wait while we process your request.',
          allowOutsideClick: false,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#f1f5f9',
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const utcDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
        const payload = {
          membershipId: plan.id,
          shopCode: this.shopCode,
          requestedDate: utcDate.toISOString()
        };

        this.shopService.bookTrial(plan.id, firebaseUid, payload).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Success!',
              text: `Trial booked successfully for ${selectedDate.toLocaleDateString()}!`,
              icon: 'success',
              confirmButtonColor: '#7c3aed',
              background: '#1e293b',
              color: '#f1f5f9'
            });

            // Refresh the component state
            this.shopService.getCustomerEvents(firebaseUid).subscribe({
              next: (eventsRes: any) => {
                if (eventsRes && eventsRes.data) {
                  this.upcomingEvents = eventsRes.data;
                  this.hasTrialBooking = this.upcomingEvents.some(event =>
                    event.shopDto?.code === this.shopCode && (event.status === 'REQUESTED' || event.status === 'APPROVED' || event.status === 'DECLINED')
                  );
                }
              }
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Failed',
              text: 'Failed to book trial. Please try again later.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              background: '#1e293b',
              color: '#f1f5f9'
            });
          }
        });
      }
    });
  }
}
