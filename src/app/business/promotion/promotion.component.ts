import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { PromotionService } from 'src/app/services/promotion.service';
import { GiftCampaignService } from 'src/app/services/gift-campaign.service';
import { PromotionOffer, CommissionPolicy } from 'src/app/models/promotion.model';
import { GiftCampaign } from 'src/app/models/gift-campaign.model';
import { OfferDialogComponent } from './offer-dialog/offer-dialog.component';
import { CampaignDialogComponent } from './campaign-dialog/campaign-dialog.component';

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss']
})
export class PromotionComponent implements OnInit, OnDestroy {
  private promotionService = inject(PromotionService);
  private giftCampaignService = inject(GiftCampaignService);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  shopCode: string | null = null;
  loading: boolean = false;

  // Active Commission Policy for the shop
  commissionPolicy: CommissionPolicy | null = null;
  loadingPolicy: boolean = false;

  // View mode: 'promotions' (Store Offers) vs 'gift_network' (Cross-shop Gift Network campaigns)
  currentView: 'promotions' | 'gift_network' = 'promotions';

  // Offers state (In-store)
  offers: PromotionOffer[] = [];
  filteredOffers: PromotionOffer[] = [];
  pagedOffers: PromotionOffer[] = [];

  // Gift Campaigns state (9Myle Gift Network)
  campaigns: GiftCampaign[] = [];
  filteredCampaigns: GiftCampaign[] = [];
  pagedCampaigns: GiftCampaign[] = [];

  searchQuery: string = '';
  activeFilter: string = 'all'; // all, active, inactive, expired

  // Pagination
  totalElements: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.shopCode = localStorage.getItem('shopCode');

    // Debounced search
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageIndex = 0;
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      this.applyFilterAndPagination();
    });

    if (this.shopCode) {
      this.loadCommissionPolicy();
      this.loadData();
    }
  }

  loadCommissionPolicy(): void {
    if (!this.shopCode) return;
    this.loadingPolicy = true;
    this.promotionService.getCommissionPolicy(this.shopCode).subscribe({
      next: (res: any) => {
        this.loadingPolicy = false;
        this.commissionPolicy = res?.data || res || null;
      },
      error: (err: any) => {
        this.loadingPolicy = false;
        console.warn('Commission policy could not be loaded:', err);
        this.commissionPolicy = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggle between In-Store Promotions and 9Myle Gift Network Campaigns
   */
  toggleViewMode(mode?: 'promotions' | 'gift_network'): void {
    if (mode) {
      this.currentView = mode;
    } else {
      this.currentView = this.currentView === 'promotions' ? 'gift_network' : 'promotions';
    }
    this.searchQuery = '';
    this.activeFilter = 'all';
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadData();
  }

  loadData(): void {
    this.loadCommissionPolicy();
    if (this.currentView === 'promotions') {
      this.loadOffers();
    } else {
      this.loadCampaigns();
    }
  }

  // ==========================================
  // 1. In-Store Promotion Offers APIs
  // ==========================================

  loadOffers(): void {
    if (!this.shopCode) return;

    this.loading = true;
    this.promotionService.getAllOffers(this.shopCode).subscribe({
      next: (res: any) => {
        this.loading = false;
        let list: PromotionOffer[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res?.data && Array.isArray(res.data)) {
          list = res.data;
        } else if (res?.data?.content && Array.isArray(res.data.content)) {
          list = res.data.content;
        } else if (res?.content && Array.isArray(res.content)) {
          list = res.content;
        }

        this.offers = list;
        this.applyFilterAndPagination();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching offers:', err);
        this.offers = [];
        this.applyFilterAndPagination();
      }
    });
  }

  openCreateOfferDialog(): void {
    const dialogRef = this.dialog.open(OfferDialogComponent, {
      width: '90vw',
      maxWidth: '650px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((result: Partial<PromotionOffer> | null) => {
      if (result) {
        this.loading = true;
        this.promotionService.createOffer(result, this.shopCode!).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Offer created successfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.loadOffers();
          },
          error: (err: any) => {
            this.loading = false;
            console.error('Error creating offer:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err?.error?.message || 'Failed to create offer'
            });
          }
        });
      }
    });
  }

  openEditOfferDialog(offer: PromotionOffer, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const dialogRef = this.dialog.open(OfferDialogComponent, {
      width: '90vw',
      maxWidth: '650px',
      data: { mode: 'edit', offer }
    });

    dialogRef.afterClosed().subscribe((result: Partial<PromotionOffer> | null) => {
      if (result && offer.id) {
        this.loading = true;
        this.promotionService.updateOffer(offer.id, result, this.shopCode!).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Offer updated successfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.loadOffers();
          },
          error: (err: any) => {
            this.loading = false;
            console.error('Error updating offer:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err?.error?.message || 'Failed to update offer'
            });
          }
        });
      }
    });
  }

  openOfferDetails(offer: PromotionOffer): void {
    if (!offer.id) return;
    this.promotionService.getOfferById(offer.id, this.shopCode!).subscribe({
      next: (res: any) => {
        const d: PromotionOffer = res?.data || res || offer;
        const discountRs = d.discountAmountPaise ? d.discountAmountPaise / 100 : 0;
        const minRs = d.minimumPurchasePaise ? d.minimumPurchasePaise / 100 : 0;
        const giftRs = d.giftCostPaise ? d.giftCostPaise / 100 : 0;

        Swal.fire({
          title: `<strong>${d.name}</strong>`,
          html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.6; color: #4b5563;">
              <p style="margin-bottom: 12px; color: #6b7280;">${d.description || ''}</p>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                <p style="margin: 4px 0;"><strong>Discount:</strong> ₹${discountRs}</p>
                <p style="margin: 4px 0;"><strong>Min. Purchase:</strong> ₹${minRs}</p>
                <p style="margin: 4px 0;"><strong>Gift Cost:</strong> ₹${giftRs}</p>
                <p style="margin: 4px 0;"><strong>Max Redemptions:</strong> ${d.maximumRedemptions}</p>
                <p style="margin: 4px 0;"><strong>Audience:</strong> ${d.newCustomersOnly ? 'New Customers Only' : 'All Customers'}</p>
                <p style="margin: 4px 0;"><strong>Validity:</strong> ${new Date(d.startDate).toLocaleDateString()} to ${new Date(d.endDate).toLocaleDateString()}</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> ${d.active !== false ? '<span style="color:#16a34a;font-weight:600">Active</span>' : '<span style="color:#ef4444;font-weight:600">Inactive</span>'}</p>
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Edit Offer',
          cancelButtonText: 'Close',
          confirmButtonColor: '#4f46e5'
        }).then((result) => {
          if (result.isConfirmed) {
            this.openEditOfferDialog(d);
          }
        });
      },
      error: () => {
        this.openEditOfferDialog(offer);
      }
    });
  }

  toggleOfferStatus(offer: PromotionOffer, event: any): void {
    if (!offer.id) return;
    const targetStatus = event.checked;

    this.promotionService.updateOfferStatus(offer.id, targetStatus, this.shopCode!).subscribe({
      next: () => {
        offer.active = targetStatus;
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: targetStatus ? 'Offer activated' : 'Offer deactivated',
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: (err: any) => {
        offer.active = !targetStatus;
        console.error('Error updating status:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.message || 'Failed to update offer status'
        });
      }
    });
  }

  deleteOffer(offer: PromotionOffer, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!offer.id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to deactivate/delete "${offer.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.promotionService.deleteOffer(offer.id!, this.shopCode!).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Offer deleted successfully',
              showConfirmButton: false,
              timer: 1800
            });
            this.loadOffers();
          },
          error: (err: any) => {
            this.loading = false;
            console.error('Error deleting offer:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err?.error?.message || 'Failed to delete offer'
            });
          }
        });
      }
    });
  }

  // ==========================================
  // 2. 9Myle Gift Network Campaign APIs
  // ==========================================

  loadCampaigns(): void {
    if (!this.shopCode) return;

    this.loading = true;
    this.giftCampaignService.listCampaigns(this.shopCode).subscribe({
      next: (res: any) => {
        this.loading = false;
        let list: GiftCampaign[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res?.data && Array.isArray(res.data)) {
          list = res.data;
        } else if (res?.data?.content && Array.isArray(res.data.content)) {
          list = res.data.content;
        } else if (res?.content && Array.isArray(res.content)) {
          list = res.content;
        }

        this.campaigns = list;
        this.applyFilterAndPagination();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error fetching campaigns:', err);
        this.campaigns = [];
        this.applyFilterAndPagination();
      }
    });
  }

  openCreateCampaignDialog(): void {
    const dialogRef = this.dialog.open(CampaignDialogComponent, {
      width: '90vw',
      maxWidth: '650px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((result: Partial<GiftCampaign> | null) => {
      if (result) {
        this.loading = true;
        this.giftCampaignService.createCampaign(result, this.shopCode!).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Campaign created successfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.loadCampaigns();
          },
          error: (err: any) => {
            this.loading = false;
            console.error('Error creating campaign:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err?.error?.message || 'Failed to create campaign'
            });
          }
        });
      }
    });
  }

  openEditCampaignDialog(campaign: GiftCampaign, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const dialogRef = this.dialog.open(CampaignDialogComponent, {
      width: '90vw',
      maxWidth: '650px',
      data: { mode: 'edit', campaign }
    });

    dialogRef.afterClosed().subscribe((result: Partial<GiftCampaign> | null) => {
      if (result && campaign.id) {
        this.loading = true;
        this.giftCampaignService.updateCampaign(campaign.id, result, this.shopCode!).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Campaign updated successfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.loadCampaigns();
          },
          error: (err: any) => {
            this.loading = false;
            console.error('Error updating campaign:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err?.error?.message || 'Failed to update campaign'
            });
          }
        });
      }
    });
  }

  openCampaignDetails(campaign: GiftCampaign): void {
    if (!campaign.id) return;
    this.giftCampaignService.getCampaignDetails(campaign.id, this.shopCode!).subscribe({
      next: (res: any) => {
        const c: GiftCampaign = res?.data || res || campaign;
        const minRs = c.minimumPurchase ? c.minimumPurchase / 100 : 0;
        const maxGiftRs = c.maximumGift ? c.maximumGift / 100 : 0;

        Swal.fire({
          title: `<strong>${c.name}</strong>`,
          html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.6; color: #4b5563;">
              <p style="margin-bottom: 12px; color: #6b7280;">${c.description || ''}</p>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                <p style="margin: 4px 0;"><strong>Reward Percentage:</strong> <span style="color:#4f46e5;font-weight:600">${c.rewardPercentage}%</span></p>
                <p style="margin: 4px 0;"><strong>Min. Qualifying Purchase:</strong> ₹${minRs}</p>
                <p style="margin: 4px 0;"><strong>Max Gift Cap:</strong> ₹${maxGiftRs}</p>
                <p style="margin: 4px 0;"><strong>Validity:</strong> ${new Date(c.startDate).toLocaleDateString()} to ${new Date(c.endDate).toLocaleDateString()}</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> ${c.active !== false ? '<span style="color:#16a34a;font-weight:600">Active</span>' : '<span style="color:#ef4444;font-weight:600">Inactive</span>'}</p>
              </div>
              <p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">
                * Customers earning gift coupons in this campaign can redeem them across the 9Myle Gift Network.
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Edit Campaign',
          cancelButtonText: 'Close',
          confirmButtonColor: '#4f46e5'
        }).then((result) => {
          if (result.isConfirmed) {
            this.openEditCampaignDialog(c);
          }
        });
      },
      error: () => {
        this.openEditCampaignDialog(campaign);
      }
    });
  }

  toggleCampaignStatus(campaign: GiftCampaign, event: any): void {
    if (!campaign.id) return;
    const targetStatus = event.checked;

    this.giftCampaignService.updateCampaignStatus(campaign.id, targetStatus, this.shopCode!).subscribe({
      next: () => {
        campaign.active = targetStatus;
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: targetStatus ? 'Campaign activated' : 'Campaign deactivated',
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: (err: any) => {
        campaign.active = !targetStatus;
        console.error('Error updating campaign status:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.message || 'Failed to update campaign status'
        });
      }
    });
  }

  deleteCampaign(campaign: GiftCampaign, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!campaign.id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to deactivate/delete campaign "${campaign.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, deactivate'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.giftCampaignService.deleteCampaign(campaign.id!, this.shopCode!).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Campaign deactivated successfully',
              showConfirmButton: false,
              timer: 1800
            });
            this.loadCampaigns();
          },
          error: (err: any) => {
            this.loading = false;
            console.error('Error deleting campaign:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err?.error?.message || 'Failed to delete campaign'
            });
          }
        });
      }
    });
  }

  // ==========================================
  // Filtering & Pagination Common Helpers
  // ==========================================

  onSearchChange(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  onFilterChange(filter: string): void {
    this.activeFilter = filter;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.applyFilterAndPagination();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginate();
  }

  private applyFilterAndPagination(): void {
    const query = (this.searchQuery || '').trim().toLowerCase();
    const now = new Date();

    if (this.currentView === 'promotions') {
      this.filteredOffers = this.offers.filter(offer => {
        const matchesSearch = !query ||
          offer.name?.toLowerCase().includes(query) ||
          offer.description?.toLowerCase().includes(query) ||
          offer.id?.toString().includes(query);

        if (!matchesSearch) return false;

        const isExpired = offer.endDate ? new Date(offer.endDate) < now : false;
        const isActive = offer.active ?? true;

        if (this.activeFilter === 'active') {
          return isActive && !isExpired;
        } else if (this.activeFilter === 'inactive') {
          return !isActive;
        } else if (this.activeFilter === 'expired') {
          return isExpired;
        }

        return true;
      });

      this.totalElements = this.filteredOffers.length;
    } else {
      this.filteredCampaigns = this.campaigns.filter(c => {
        const matchesSearch = !query ||
          c.name?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.id?.toString().includes(query);

        if (!matchesSearch) return false;

        const isExpired = c.endDate ? new Date(c.endDate) < now : false;
        const isActive = c.active ?? true;

        if (this.activeFilter === 'active') {
          return isActive && !isExpired;
        } else if (this.activeFilter === 'inactive') {
          return !isActive;
        } else if (this.activeFilter === 'expired') {
          return isExpired;
        }

        return true;
      });

      this.totalElements = this.filteredCampaigns.length;
    }

    this.paginate();
  }

  private paginate(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;

    if (this.currentView === 'promotions') {
      this.pagedOffers = this.filteredOffers.slice(start, end);
    } else {
      this.pagedCampaigns = this.filteredCampaigns.slice(start, end);
    }
  }

  isExpired(endDate: string): boolean {
    if (!endDate) return false;
    return new Date(endDate).getTime() < Date.now();
  }
}
