import { Component, HostListener, inject } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FormsModule } from '@angular/forms';
import { SidePanelComponent } from 'src/app/components/shared/side-panel/side-panel.component';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { Chart, registerables } from 'chart.js';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MembershipActionsComponent } from './membership-actions/membership-actions.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ResponseDate } from 'src/app/app.component';
import { OrganizationMembershipPlan } from 'src/app/models/organization';
import { Industry } from 'src/app/models/business.model';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MembershipPurchaseCount } from 'src/app/models/shop.model';

import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { BoosterService } from 'src/app/services/booster.service';
import { BoosterPlanDto, DurationUnit } from 'src/app/models/booster.model';

interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'app-membership-details',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule, NzAvatarModule, NzRateModule, FormsModule,
    SidePanelComponent, MatButtonModule,
    DecimalPipe, NzSegmentedModule, NzIconModule, NzInputModule, NzSelectModule, NzButtonModule,
    NzMessageModule, NzSwitchModule, NzSpinModule, NzToolTipModule, NzTagModule
  ],
  templateUrl: './membership-details.component.html',
  styleUrl: './membership-details.component.scss'
})
export class MembershipDetailsComponent {
  isMobileView = false;
  private boosterService = inject(BoosterService);
  private nzMessage = inject(NzMessageService);

  constructor(private orgService: OrganizationServiceService, private dataService: DataStorageService, private dashboardService: DashboardService) {
    // Register Chart.js modules to avoid tree-shaking issues
    Chart.register(...registerables);
    // Fetch All Organization Membership
    this.industries = dataService.getIndustry();
    if (this.industries.length < 1) {
      this.getOrgIndustry();
    } else {
      this.getOrgMemberships();
    }
    this.loadMembershipPurchaseCounts();
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
  }

  isPanelOpen: boolean = false;
  loading: boolean = true;
  options = ['Details', 'Trend'];
  activeSegment: string | number = 'Details'
  chart: Chart | null = null;

  inputValue: string | null = null;
  textValue: string | null = null;
  isLoading = false;

  // Select 
  optionList: Option[] = [
    { label: 'Monthly', value: 'MONTH' },
    { label: 'Quaterly', value: 'QUATER' },
    { label: 'Half Yearly', value: 'HALFYEAR' },
    { label: 'Yearly', value: 'YEARLY' }
  ];
  selectedValue!: Option;
  readonly compareFn = (o1: Option, o2: Option): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  log(value: Option): void {
    console.log(value);
  }

  // 
  membershipType = "A";

  ngAfterViewInit(): void {
    this.createChart();
  }

  handleValueChange(e: string | number): void {
    console.log(e);
    this.activeSegment = e;
    if (e === 'Trend') {
      setTimeout(() => this.createChart(), 0); // Wait for the DOM to render
    } else if (this.chart) {
      this.destroyChart();
    }
  }

  closePanel(): void {
    this.isPanelOpen = false;
  }

  openPanel() {
    this.isPanelOpen = true;
  }

  createChart(): void {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    if (ctx && !this.chart) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
            {
              label: 'Users',
              data: [65, 59, 80, 81, 56, 55, 40],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
          },
        },
      });
    }
  }

  destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  //  Real flow
  readonly dialog = inject(MatDialog);
  memberships: OrganizationMembershipPlan[] = [];
  industries: Industry[] = [];

  // Membership purchase counts (active/inactive breakdown per plan)
  membershipPurchaseCounts: MembershipPurchaseCount[] = [];
  isZoomModalOpen = false;
  sortBy: 'default' | 'active' | 'inactive' = 'default';

  loadMembershipPurchaseCounts() {
    try {
      this.dashboardService.getMembershipPurchaseCounts().subscribe({
        next: (res) => {
          this.membershipPurchaseCounts = res.data || [];
        },
        error: (err) => console.error('Error fetching membership purchase counts:', err)
      });
    } catch (e) {
      console.warn('DashboardService requires active shopCode:', e);
    }
  }

  // Purchase breakdown for a given membership, matched by plan name.
  getPurchaseCount(membership: OrganizationMembershipPlan): MembershipPurchaseCount | undefined {
    return this.membershipPurchaseCounts.find(pc => pc.membershipPlanName === membership.name);
  }

  get sortedMembershipPurchaseCounts() {
    const list = [...this.membershipPurchaseCounts];
    if (this.sortBy === 'active') {
      return list.sort((a, b) => b.activeCount - a.activeCount);
    } else if (this.sortBy === 'inactive') {
      return list.sort((a, b) => b.inactiveCount - a.inactiveCount);
    }
    return list;
  }

  toggleSort() {
    if (this.sortBy === 'default') {
      this.sortBy = 'active';
    } else if (this.sortBy === 'active') {
      this.sortBy = 'inactive';
    } else {
      this.sortBy = 'default';
    }
  }

  openZoomModal() {
    this.isZoomModalOpen = true;
  }

  closeZoomModal() {
    this.isZoomModalOpen = false;
  }

  setMembership(data: OrganizationMembershipPlan[]) {
    this.memberships = data;
    this.memberships.forEach(membership => {
      membership.industry = this.industries.find(industry => industry.id == membership.industryId)?.name;
      // Calculate maximum duration for the membership
      membership.maxDuration = this.calculateMaxDuration(membership.benefits);
    });
  }

  calculateMaxDuration(benefits: any[]): { value: number; unit: string } | undefined {
    if (!benefits || benefits.length === 0) {
      return undefined;
    }

    // Filter benefits with duration information
    const durationBenefits = benefits.filter((benefit: any) =>
      benefit.durationValue && benefit.durationUnit &&
      benefit.benefitType === 'DURATION_ACCESS'
    );

    if (durationBenefits.length === 0) {
      return undefined;
    }

    // Find the benefit with the maximum duration value
    let maxDurationBenefit = durationBenefits[0];
    for (const benefit of durationBenefits) {
      if (benefit.durationValue > maxDurationBenefit.durationValue) {
        maxDurationBenefit = benefit;
      }
    }

    return {
      value: maxDurationBenefit.durationValue,
      unit: maxDurationBenefit.durationUnit
    };
  }


  getOrgMemberships() {
    this.isLoading = true;
    this.orgService.getAllOrgMembership().subscribe({
      next: (res: ResponseDate) => {
        this.isLoading = false;
        this.setMembership(res.data);
      },
      error: (err: any) => {
        this.isLoading = false;
      }
    })
  }

  getOrgIndustry() {
    this.orgService.getOrgIndustryByShop().subscribe({
      next: (res: any) => {
        this.industries = res.data;
        this.dataService.setIndustry(this.industries);
        this.getOrgMemberships();
      },
      error: (err: any) => {

      }
    })
  }

  // Create Membership 
  openMembershipAction() {
    const dialogRef = this.dialog.open(MembershipActionsComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        let updatedMemberships = this.memberships.filter(membership => membership.id != result.id);
        updatedMemberships.push(result);
        this.setMembership(updatedMemberships);
      }
    });
  }

  openEditMembership(membershipPlan: OrganizationMembershipPlan) {
    const dialogRef = this.dialog.open(MembershipActionsComponent, {
      data: { existingPlan: membershipPlan, isUpdate: true },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        let updatedMemberships = this.memberships.filter(membership => membership.id != result.id);
        updatedMemberships.push(result);
        this.setMembership(updatedMemberships);
      }
    });
  }

  // Booster Side Panel State & Form
  isBoosterPanelOpen = false;
  selectedMembershipForBooster: OrganizationMembershipPlan | null = null;
  isBoosterLoading = false;
  isBoosterSaving = false;
  hasExistingBooster = false;
  boosterErrorMessage: string | null = null;
  boosterSuccessMessage: string | null = null;

  boosterForm: BoosterPlanDto = {
    id: undefined,
    membershipPlanId: 0,
    price: 0,
    attendanceTargetDays: 30,
    rewardDurationValue: 1,
    rewardDurationUnit: 'MONTH',
    active: true
  };

  durationUnitOptions: { label: string; value: DurationUnit }[] = [
    { label: 'Day(s)', value: 'DAY' },
    { label: 'Month(s)', value: 'MONTH' },
    { label: 'Year(s)', value: 'YEAR' }
  ];

  openBoosterPanel(membership: OrganizationMembershipPlan) {
    this.selectedMembershipForBooster = membership;
    this.isBoosterPanelOpen = true;
    this.boosterErrorMessage = null;
    this.boosterSuccessMessage = null;
    this.hasExistingBooster = false;

    // Reset form defaults for creation
    this.boosterForm = {
      id: undefined,
      membershipPlanId: membership.id || 0,
      price: 0,
      attendanceTargetDays: 30,
      rewardDurationValue: 1,
      rewardDurationUnit: 'MONTH',
      active: true
    };

    if (membership.id) {
      this.fetchBoosterPlan(membership.id);
    }
  }

  closeBoosterPanel() {
    this.isBoosterPanelOpen = false;
    this.selectedMembershipForBooster = null;
  }

  fetchBoosterPlan(membershipPlanId: number) {
    this.isBoosterLoading = true;
    this.boosterService.getBoosterPlan(membershipPlanId).subscribe({
      next: (res) => {
        this.isBoosterLoading = false;
        if (res && res.data) {
          this.hasExistingBooster = true;
          this.boosterForm = {
            id: res.data.id,
            membershipPlanId: res.data.membershipPlanId || membershipPlanId,
            price: res.data.price ?? 0,
            attendanceTargetDays: res.data.attendanceTargetDays ?? 0,
            rewardDurationValue: res.data.rewardDurationValue ?? 1,
            rewardDurationUnit: res.data.rewardDurationUnit || 'MONTH',
            active: res.data.active ?? true
          };
        } else {
          this.hasExistingBooster = false;
        }
      },
      error: (err) => {
        this.isBoosterLoading = false;
        this.hasExistingBooster = false;
      }
    });
  }

  saveBoosterPlan() {
    if (!this.selectedMembershipForBooster || !this.selectedMembershipForBooster.id) {
      this.nzMessage.error('No membership selected.');
      return;
    }

    if (this.boosterForm.price === null || this.boosterForm.price === undefined || this.boosterForm.price < 0) {
      this.nzMessage.error('Please enter a valid booster price.');
      return;
    }

    if (!this.boosterForm.attendanceTargetDays || this.boosterForm.attendanceTargetDays <= 0) {
      this.nzMessage.error('Please enter target attendance days.');
      return;
    }

    if (!this.boosterForm.rewardDurationValue || this.boosterForm.rewardDurationValue <= 0) {
      this.nzMessage.error('Please enter valid reward duration.');
      return;
    }

    this.isBoosterSaving = true;
    this.boosterErrorMessage = null;
    this.boosterSuccessMessage = null;

    const payload: BoosterPlanDto = {
      id: this.boosterForm.id,
      membershipPlanId: this.selectedMembershipForBooster.id,
      price: Number(this.boosterForm.price),
      attendanceTargetDays: Number(this.boosterForm.attendanceTargetDays),
      rewardDurationValue: Number(this.boosterForm.rewardDurationValue),
      rewardDurationUnit: this.boosterForm.rewardDurationUnit,
      active: this.boosterForm.active ?? true
    };

    this.boosterService.upsertBoosterPlan(this.selectedMembershipForBooster.id, payload).subscribe({
      next: (res) => {
        this.isBoosterSaving = false;
        this.nzMessage.success(res.message || 'Booster plan saved successfully!');
        this.boosterSuccessMessage = res.message || 'Booster plan saved successfully!';
        if (res && res.data) {
          this.hasExistingBooster = true;
          this.boosterForm = { ...res.data };
        }
      },
      error: (err) => {
        this.isBoosterSaving = false;
        const msg = err?.error?.message || 'Failed to save booster plan. Please try again.';
        this.nzMessage.error(msg);
        this.boosterErrorMessage = msg;
      }
    });
  }
}