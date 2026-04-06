import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ResponseDate } from 'src/app/app.component';
import { Customer } from 'src/app/models/customer.model';
import { UserDto } from 'src/app/services/auth.service';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-god-box',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, MatDialogModule],
  templateUrl: './god-box.component.html',
  styleUrl: './god-box.component.scss'
})
export class GodBoxComponent implements OnInit, AfterViewInit {

  orgService = inject(OrganizationServiceService);
  searchQuery = '';
  tabs = ['Customer'];
  selectedTab = 'Customer';
  private searchTimeout: any;
  customers: any[] = [];

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private dialogRef: MatDialogRef<GodBoxComponent>,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Initial fetch of customers when dialog opens
    this.performSearch(true);
  }

  ngAfterViewInit() {
    // Auto-focus the search input after the view initializes
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.focus();
        // Fallback for some browsers/timing issues
        this.searchInput.nativeElement.select();
      }
    }, 200);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSearchChange() {
    this.performSearch();
  }

  private performSearch(immediate: boolean = false) {
    // Clear old timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const fetch = () => {
      if (this.selectedTab == "Customer") {
        this.orgService.getCustomerByOrgShop(0, 50, this.searchQuery, undefined).subscribe({
          next: (res: ResponseDate) => {
            this.customers = res.data.map((customer: any) => ({
              ...customer,
              profileImage: customer.documentDto?.attachments?.[0]?.url
            }));
          },
          error: (err: any) => {
            console.error('Initial GodBox fetch failed', err);
          }
        });
      }
    };

    if (immediate) {
      fetch();
    } else {
      // Set new timeout (debounce 400ms)
      this.searchTimeout = setTimeout(() => {
        fetch();
      }, 400);
    }
  }



  returnCustomer(customer: any) {
    this.dialogRef.close(customer);
  }

  openImagePreview(url: string, event: MouseEvent): void {
    event.stopPropagation();
    this.dialog.open(ImagePreviewDialog, {
      data: { url },
      panelClass: 'image-preview-dialog',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
  }
}

// Simple internal component for image preview
@Component({
  selector: 'image-preview-dialog-gb',
  standalone: true,
  template: `
    <div style="position: relative; line-height: 0; background: transparent; padding: 0;">
      <img [src]="data.url" style="max-width: 100%; max-height: 90vh; display: block; border-radius: 4px; box-shadow: 0 4px 24px rgba(0,0,0,0.3);">
      <button (click)="dialogRef.close()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); transition: background 0.2s;">
        <span style="font-size: 24px; line-height: 1;">&times;</span>
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; padding: 0; background: transparent; }
  `],
  imports: []
})
export class ImagePreviewDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { url: string },
    public dialogRef: MatDialogRef<ImagePreviewDialog>
  ) { }
}