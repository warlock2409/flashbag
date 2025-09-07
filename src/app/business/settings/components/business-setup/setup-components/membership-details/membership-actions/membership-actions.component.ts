import { Component, inject, model, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ServiceDialogComponent } from '../service-dialog/service-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { Industry } from 'src/app/models/business.model';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ShopModel } from 'src/app/models/shop.model';
import { ResponseDate } from 'src/app/app.component';
import { OrganizationMembershipPlan, OrganizationServiceModel } from 'src/app/models/organization';

@Component({
  selector: 'app-membership-actions',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule, CommonModule, FormsModule, MatStepperModule],
  templateUrl: './membership-actions.component.html',
  styleUrl: './membership-actions.component.scss'
})
export class MembershipActionsComponent {

  readonly dialogRef = inject(MatDialogRef<MembershipActionsComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  industries: Industry[] = [];
  shops: ShopModel[] = [];
  membershipPlan!: OrganizationMembershipPlan;
  @ViewChild('stepper') stepper!: MatStepper;

  // temp 
  benefitType = 'DURATION_ACCESS';
  days = '0';

  initializePlan(): void {
    this.membershipPlan = {
      name: '',
      basePrice: 0,
      description: '',
      challengeBased: false,
      industryId: 0,
      benefits: [],
      shopIds: []
    };
  }



  constructor(private dialog: MatDialog, private orgService: OrganizationServiceService) {

  }


  closeDialog() {
    this.dialogRef.close();
  }

  validateMembershipDetails() {
    if (this.selectedServices.length < 1) {
      return;
    }
    this.loadShopsByActiveService();
    this.stepper.next();
  }

  stepperPrev() {
    this.stepper.previous();
  }

  ngOnInit() {
    this.getOrgIndustry();
    this.initializePlan();
  }

  loadShopsByActiveService() {
    let serviceIds = this.selectedServices.map(service => service.id);
    this.orgService.getOrgShopsByActiveService(serviceIds).subscribe({
      next: (res: ResponseDate) => {
        this.shops = res.data.map((shop: ShopModel) => ({
          ...shop,
          checked: true
        }));
      },
      error: (err: any) => {

      }
    })
  }


  getOrgIndustry() {
    this.orgService.getOrgIndustryByShop().subscribe({
      next: (res: any) => {
        this.industries = res.data;
      },
      error: (err: any) => {

      }
    })
  }

  selectedServices: OrganizationServiceModel[] = [];

  openServiceDialog() {
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '600px',
      data: { selected: this.selectedServices }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedServices = result;
      }
    });
  }




  onNoClick(): void {
    this.dialogRef.close();
  }

  // 
  createMembership() {
    this.membershipPlan.benefits = this.selectedServices.map(service => ({
      benefitType: this.benefitType,     // from variable
      days: Number(this.days),                 // from variable
      serviceKey: service.serviceKey!     // from selected service
    }));

    this.membershipPlan.shopIds = this.shops.filter(shop => shop.checked).map(shop => shop.id!);

    console.log(this.membershipPlan);
    
    this.orgService.createOrgMembership(this.membershipPlan).subscribe({
      next:(res:ResponseDate)=>{
        this.dialogRef.close(res.data);
      },
      error:(err:any)=>{
      }
    })

  }
}
