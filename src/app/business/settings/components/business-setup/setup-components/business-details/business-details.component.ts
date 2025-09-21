import { Component, inject } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PointOfSaleComponent } from 'src/app/business/components/point-of-sale/point-of-sale.component';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { ResponseDate } from 'src/app/app.component';
import { ShopModel } from 'src/app/models/shop.model';
import { OrganizationModel } from 'src/app/models/organization';
import { UploadMediaComponent } from "src/app/components/upload-media/upload-media.component";
@Component({
  selector: 'app-business-details',
  standalone: true,
  imports: [NzCardModule, NzBadgeModule, NzDescriptionsModule, CommonModule, MatButtonModule, MatDialogModule, MatButtonModule, UploadMediaComponent],
  templateUrl: './business-details.component.html',
  styleUrl: './business-details.component.scss'
})
export class BusinessDetailsComponent {
  managePlan() {
    throw new Error('Method not implemented.');
  }
  dialog = inject(MatDialog);

  constructor(private route: ActivatedRoute, private router: Router, private organizationService: OrganizationServiceService) { }

  currentView = 'organization';

  details!: any;

  ngOnInit(): void {
    // Get full URL path (without domain)
    const path = this.router.url.split('?')[0];
    console.log('Path:', path);
    // Subscribe to query params changes
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length) {
        console.log('All query params:', params);
      } else {
        console.log('No query params found');
      }
      // Example: access individually
      if (params['view']) {
        this.currentView = params['view'];
      }
      if (params['mode']) {
        console.log('Mode:', params['mode']);
      }
    });

    this.getOrganizationDetails();
  }

  getOrganizationDetails() {
    this.organizationService.getOrganizationDetails().subscribe({
      next: (res: ResponseDate) => {
        console.log(res);
        this.details = res.data;
      },
      error: (err: any) => {

      }
    })
  }

  buyPlan() {
    const dialogRef = this.dialog.open(PointOfSaleComponent, {
      width: '100%',
      maxWidth: '100vw', // override default 80vw
      height: '100%',
      panelClass: 'full-screen-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  getStatusColor(status: string): string {
    if (!status) {
      return 'default'; // fallback color for undefined/null status
    }
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'processing';   // orange
      case 'ACTIVE':
        return 'success';   // green
      case 'INACTIVE':
        return 'error';   // gray
      case 'BLOCKED':
        return 'error';   // red
      default:
        return 'default';   // blue for unknown
    }
  }




}
