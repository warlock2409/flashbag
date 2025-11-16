import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SidePanelComponent } from 'src/app/components/shared/side-panel/side-panel.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzI18nService, en_US } from 'ng-zorro-antd/i18n';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { OrganizationServiceService } from 'src/app/services/organization-service.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResponseDate } from 'src/app/app.component';
import { ShopModel } from 'src/app/models/shop.model';
import { ShopActionsComponent } from "./location-action/shop-actions/shop-actions.component";
import { MatDialog } from '@angular/material/dialog';
import { NzBadgeComponent } from "ng-zorro-antd/badge";

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [
    FormsModule, NzCardModule, NzImageModule,
    NzButtonModule, NzPopoverModule, CommonModule,
    MatButtonModule, SidePanelComponent, NzAvatarModule,
    NzRateModule, NzSegmentedModule, MatCheckboxModule, NzTimePickerModule, MatIcon, NzInputModule, NzSelectModule, MatStepperModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTooltipModule,
    ShopActionsComponent,
    NzBadgeComponent
],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent {
  isMobileView = false;
  shops: ShopModel[] = [];

  constructor(private i18n: NzI18nService, private route: ActivatedRoute, private orgApiService: OrganizationServiceService) {
    this.i18n.setLocale(en_US);
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
  }

  fallback = 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHY4eXlkdHhxZWQwNHozb2Z0cHEwZG42OWpsMWw1NWQ2NzZsZWRtdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Xf7dN80WrC7PsoM6H6/giphy.gif';
  visible: boolean = false;
  editShopPanel: boolean = false;
  addShopPanel: boolean = false;
  options = ['Basic', 'Location', 'Business Hours', 'Billing'];
  activeSegment: string | number = 'Basic'
  // Dummy 

  dialog = inject(MatDialog);
  isLoading = false;
  ngOnInit(): void {
    console.log("*Locations*");

    this.getLocations();
    // this.route.queryParams.subscribe(queryParams => {
    //   this.selectedModel = queryParams['model'];
    //   if (this.selectedModel)
    //     this.getLocations(this.selectedModel);
    // });
  }

  getLocations() {
    this.isLoading = true;
    this.orgApiService.getLocations().subscribe({
      next: (res: ResponseDate) => {
        this.isLoading = false;

        this.shops = res.data.map((shop: ShopModel) => {
          // Make sure attachments exist
          const attachments = shop.documentDto?.attachments ?? [];
          // Sort attachments by displayOrder (nulls at the end)
          attachments.sort((a: any, b: any) => {
            if (a.displayOrder == null && b.displayOrder == null) return 0;
            if (a.displayOrder == null) return 1;  // push nulls to bottom
            if (b.displayOrder == null) return -1;
            return a.displayOrder - b.displayOrder;
          });
          return {
            code: shop.code,
            address: this.formatAddress(shop.addressDto),
            image: attachments.length && attachments[0].url ? attachments[0].url : this.fallback,
            ...shop
          };
        });
        console.log(this.shops);

      },
      error: (err: any) => {
        this.isLoading = false;
      }
    })
  }

  formatAddress(address: any): string {
    if (!address) return '';

    return [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ]
      .filter(Boolean) // remove null/undefined
      .join(', ');
  }

  handleValueChange(e: string | number): void {
    console.log(e);
    this.activeSegment = e;
  }

  closePanel(actionType: string): void {
    console.log(actionType);

    if (actionType == 'ADD_SHOP') {
      this.addShopPanel = false;
    } else {
      this.editShopPanel = false;
    }
  }

  openPanel(actionType: string) {
    if (actionType == 'ADD_SHOP') {
      this.addShopPanel = true;
    } else {
      this.editShopPanel = true;
    }
  }

  location: SegmentData = {};

  createLocation() {
    const dialogRef = this.dialog.open(ShopActionsComponent, {
      data: { isUpdate: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with:', result);
      this.getLocations();
    });
  }

  editLocation(ShopModel: ShopModel) {
    const dialogRef = this.dialog.open(ShopActionsComponent, {
      data: { isUpdate: true, shop: ShopModel }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with:', result);
      this.getLocations();
    });
  }

  getNewLocation() {
    return {
      Basic: {
        title: '',
        avatarUrl: 'https://scontent.fcjb3-2.fna.fbcdn.net/o1/v/t0/f2/m340/AQMxq0IOO3n8Ka_K7aqX2U4AGKtAmFEoEQCOdmXJpNmAUSaoWNxghHiJupovfOa491ClX8EACjuvNV9T7BBygg-7YeGHw4XHIhqF1xqV59vPQ83hXBgJJtOv6J5xXnzweZeKsd-1YpdKTPixyC2kHtlg-MI7dg.jpeg?_nc_ht=scontent.fcjb3-2.fna.fbcdn.net&_nc_gid=ta6xDRQeGGfFV0XbsK6DJg&_nc_cat=102&_nc_oc=AdkjmE2beVZCUXaXC2NJNslgCHZn-Fs18ule9a4Ooz8Rqdj6uwJo57MKTe73SJVyYcAzJ9anRg37fgKh03ONbEuj&ccb=9-4&oh=00_AfNsAZlmg43LJ4gfXwCnKNYRv3NV_38eb2SRg_BnpfZSqw&oe=68472329&_nc_sid=5b3566',
        rating: null,
        reviews: 0,
        contactDetails: {
          email: '',
          phone: ''
        },
        businessTypes: {
          main: [],
          additional: []
        }
      },
      Location: {
        address: ''
      },
      BusinessHours: {
        daysOfWeek: [],
        time: new Date()
      },
      Billing: {
        saleReceipt: {
          address: ''
        },
        taxDefaults: {
          services: ''
        },
        tipping: {
          defaultValues: [],
          method: ''
        }
      }
    };
  }

  change(value: boolean): void {
    console.log(value);
  }

  activePopover: string | null = null;

  changePopover(visible: boolean, id: string): void {
    this.activePopover = visible ? id : null;
  }
}

export interface SegmentData {
  Basic?: {
    title: string;
    avatarUrl: string;
    rating: number | null;
    reviews: number;
    contactDetails: {
      email: string;
      phone: string;
    };
    businessTypes: {
      main: string[];
      additional: string[];
    };
  };
  Location?: {
    address: string;
  };
  BusinessHours?: {
    daysOfWeek: string[];
    time: Date;
  };
  Billing?: {
    saleReceipt: {
      address: string;
    };
    taxDefaults: {
      services: string;
    };
    tipping: {
      defaultValues: string[];
      method: string;
    };
  };
}