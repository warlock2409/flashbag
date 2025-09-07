import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ResponseDate } from 'src/app/app.component';
import { Industry } from 'src/app/models/business.model';
import { ShopModel } from 'src/app/models/shop.model';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ServiceActionsComponent } from './service-actions/service-actions.component';
import { OrganizationServiceModel } from 'src/app/models/organization';

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [MatButtonModule, FormsModule, CommonModule],
  templateUrl: './service-details.component.html',
  styleUrl: './service-details.component.scss'
})
export class ServiceDetailsComponent {


  services: OrganizationServiceModel[] = [];
  industries: Industry[] = [];
  selectedIndustryId: number | '' = '';
  shops: ShopModel[] = [];
  selectedShopId: number | '' = '';


  constructor(private orgService: OrganizationServiceService) {
    this.getOrgIndustry();
    this.getOrganizationService();
    // 
  }

  readonly dialog = inject(MatDialog);

  openServiceAction() {
    console.log(this.industries);

    const dialogRef = this.dialog.open(ServiceActionsComponent,
      {
        data: { industries: this.industries, price: 250 }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.services.push(result)
      }
    });
  }

  onIndustryChange($event: Event) {
    const selectedValue = ($event.target as HTMLSelectElement).value;
    console.log('Selected Industry ID:', selectedValue);

    // Example: trigger shop loading when industry changes
    if (selectedValue) {
      this.loadShopsByIndustry(+selectedValue);
    } else {
      this.shops = []; // clear shops if "All Industries"
    }

  }

  loadShopsByIndustry(industryId: number) {
    this.orgService.getOrgShopsByIndustry(industryId).subscribe({
      next: (res: ResponseDate) => {
        this.shops = res.data;
      },
      error: (err: any) => {

      }
    })
  }

  ngOnInit() {

  }

  getOrgIndustry() {
    this.orgService.getOrgIndustryByShop().subscribe({
      next: (res: any) => {
        this.industries = res.data;
        console.log(this.industries);

      },
      error: (err: any) => {

      }
    })
  }

  getOrganizationService() {
    this.orgService.getOrgService().subscribe({
      next: (res: ResponseDate) => {
        this.services = res.data;
        console.log(this.services);
      },
      error: (err: any) => {

      }
    })
  }

  deleteService(serviceKey: string) {
    this.orgService.deleteService(serviceKey).subscribe({
      next: (res: ResponseDate) => {
        this.services = this.services.filter((service:OrganizationServiceModel) => service.serviceKey != serviceKey);
      },
      error: (err: any) => {

      }
    })
  }


}
